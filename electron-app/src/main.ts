import { app, BrowserWindow, Tray, Menu, nativeImage, clipboard, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log';
import { Encryption, SupabaseService, ClipboardItem } from 'shared';

// Setup config store
const store = new Store({
  name: 'clipboard-sync-config',
  defaults: {
    pairId: '',
    pairName: '',
    encryptionKey: '',
    supabaseUrl: '',
    supabaseKey: '',
    startAtLogin: true,
    copyToClipboard: true,
    showNotifications: true
  }
});

// App variables
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let supabaseService: SupabaseService | null = null;
let clipboardSubscription: { unsubscribe: () => void } | null = null;
let lastClipboardContent: string = '';
let isQuitting = false;

// Configuration
const ICON_PATH = path.join(__dirname, '..', 'assets', 'icon.png');
const CONFIG_DEFAULTS = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_ANON_KEY || ''
};

// Initialize supabase service
function initSupabase() {
  const url = store.get('supabaseUrl') as string || CONFIG_DEFAULTS.supabaseUrl;
  const key = store.get('supabaseKey') as string || CONFIG_DEFAULTS.supabaseKey;

  if (!url || !key) {
    log.error('Supabase configuration is missing');
    return false;
  }

  try {
    supabaseService = SupabaseService.getInstance(url, key);
    log.info('Supabase service initialized');
    return true;
  } catch (error) {
    log.error('Failed to initialize Supabase:', error);
    return false;
  }
}

// Subscribe to clipboard changes from other devices
function subscribeToClipboard() {
  const pairId = store.get('pairId') as string;
  
  if (!pairId || !supabaseService) {
    log.warn('Cannot subscribe to clipboard: Missing pair ID or Supabase service');
    return;
  }

  if (clipboardSubscription) {
    clipboardSubscription.unsubscribe();
  }

  clipboardSubscription = supabaseService.subscribeToClipboard(pairId, (item) => {
    handleIncomingClipboardItem(item);
  });

  log.info(`Subscribed to clipboard changes for pair ID: ${pairId}`);
}

// Handle clipboard items from other devices
async function handleIncomingClipboardItem(item: ClipboardItem) {
  log.info(`Received new clipboard item of type: ${item.content_type}`);
  
  // Skip if this device is the source
  if (item.source_device === 'desktop') {
    return;
  }

  const encryptionKey = store.get('encryptionKey') as string;
  if (!encryptionKey) {
    log.error('No encryption key available');
    return;
  }

  try {
    // Decrypt content
    const decryptedContent = Encryption.decrypt(item.content, encryptionKey);
    
    if (store.get('copyToClipboard')) {
      // Handle by content type
      if (item.content_type === 'file') {
        // Handle file data (would save to temp directory)
        const base64Data = decryptedContent;
        const filePath = path.join(app.getPath('temp'), item.file_name || 'unknown_file');
        
        // Extract the base64 data after the data URL prefix
        const base64Content = base64Data.split(';base64,').pop() || '';
        fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));
        
        // You could open the file, or just copy its path to clipboard
        clipboard.writeText(filePath);
      } else {
        // For text and links, just copy to clipboard
        clipboard.writeText(decryptedContent);
      }
      
      log.info('Content copied to clipboard');
    }

    // Show notification if enabled
    if (store.get('showNotifications')) {
      const { Notification } = require('electron');
      new Notification({
        title: 'New clipboard content',
        body: item.content_type === 'file' 
          ? `File: ${item.file_name}` 
          : `Type: ${item.content_type}`,
        icon: ICON_PATH
      }).show();
    }
  } catch (error) {
    log.error('Error handling clipboard item:', error);
  }
}

// Watch for clipboard changes on this device
function watchClipboard() {
  let checkClipboardInterval: NodeJS.Timeout;
  
  const checkClipboard = async () => {
    const currentText = clipboard.readText();
    
    // If text exists and is different from last check
    if (currentText && currentText !== lastClipboardContent) {
      lastClipboardContent = currentText;
      
      const pairId = store.get('pairId') as string;
      const encryptionKey = store.get('encryptionKey') as string;
      
      if (!pairId || !encryptionKey || !supabaseService) {
        return;
      }
      
      // Determine if it's a link
      const isLink = /^https?:\/\//.test(currentText);
      const contentType = isLink ? 'link' : 'text';
      
      try {
        // Encrypt the content
        const encryptedContent = Encryption.encrypt(currentText, encryptionKey);
        
        // Send to server
        await supabaseService.addClipboardItem({
          pair_id: pairId,
          content: encryptedContent,
          content_type: contentType,
          source_device: 'desktop'
        });
        
        log.info(`Clipboard content (${contentType}) sent to server`);
      } catch (error) {
        log.error('Error sending clipboard content:', error);
      }
    }
  };
  
  // Check clipboard every second
  checkClipboardInterval = setInterval(checkClipboard, 1000);
  
  // Return cleanup function
  return () => {
    clearInterval(checkClipboardInterval);
  };
}

// Create the main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: ICON_PATH,
    show: false // Initially hidden
  });

  // Load settings UI (could be local HTML or a React dev server)
  mainWindow.loadFile(path.join(__dirname, '../ui/index.html'));
  
  // Show DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      return false;
    }
    return true;
  });

  mainWindow.once('ready-to-show', () => {
    // Only show window on first run or if there's no valid configuration
    const hasPairId = Boolean(store.get('pairId'));
    if (!hasPairId) {
      mainWindow?.show();
    }
  });
}

// Create tray icon and menu
function createTray() {
  const icon = nativeImage.createFromPath(ICON_PATH);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Settings', click: () => mainWindow?.show() },
    { type: 'separator' },
    { 
      label: 'Start at Login', 
      type: 'checkbox', 
      checked: Boolean(store.get('startAtLogin')),
      click: (menuItem) => {
        store.set('startAtLogin', menuItem.checked);
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked
        });
      }
    },
    { 
      label: 'Auto-Copy to Clipboard', 
      type: 'checkbox', 
      checked: Boolean(store.get('copyToClipboard')),
      click: (menuItem) => {
        store.set('copyToClipboard', menuItem.checked);
      }
    },
    { 
      label: 'Show Notifications', 
      type: 'checkbox', 
      checked: Boolean(store.get('showNotifications')),
      click: (menuItem) => {
        store.set('showNotifications', menuItem.checked);
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      isQuitting = true;
      app.quit();
    }}
  ]);
  
  tray.setToolTip('ClipSync');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}

// Handle IPC messages from renderer process
function setupIPC() {
  // Generate and save new pairing data
  ipcMain.handle('generate-pair', () => {
    const pairId = uuidv4();
    const pairName = `Desktop-${Math.floor(Math.random() * 10000)}`;
    const encryptionKey = uuidv4();
    
    store.set('pairId', pairId);
    store.set('pairName', pairName);
    store.set('encryptionKey', encryptionKey);
    
    subscribeToClipboard();
    
    return { pairId, pairName, encryptionKey };
  });
  
  // Save existing pairing data
  ipcMain.handle('save-pair', (_, pairId: string, pairName: string, encryptionKey: string) => {
    store.set('pairId', pairId);
    store.set('pairName', pairName);
    store.set('encryptionKey', encryptionKey);
    
    subscribeToClipboard();
    
    return true;
  });
  
  // Get current pairing data
  ipcMain.handle('get-pair', () => {
    return {
      pairId: store.get('pairId'),
      pairName: store.get('pairName')
    };
  });
  
  // Save Supabase configuration
  ipcMain.handle('save-supabase-config', (_, url: string, key: string) => {
    store.set('supabaseUrl', url);
    store.set('supabaseKey', key);
    
    initSupabase();
    subscribeToClipboard();
    
    return true;
  });
  
  // Get clipboard history
  ipcMain.handle('get-clipboard-history', async (_, limit: number = 20) => {
    if (!supabaseService) return [];
    
    const pairId = store.get('pairId') as string;
    const encryptionKey = store.get('encryptionKey') as string;
    if (!pairId || !encryptionKey) return [];
    
    const items = await supabaseService.getClipboardHistory(pairId, limit);
    
    // Decrypt items
    return items.map(item => {
      try {
        return {
          ...item,
          decryptedContent: Encryption.decrypt(item.content, encryptionKey)
        };
      } catch (e) {
        return {
          ...item,
          decryptedContent: '(Unable to decrypt)'
        };
      }
    });
  });
}

// App initialization
app.whenReady().then(() => {
  log.info('Application starting up');
  
  createMainWindow();
  createTray();
  setupIPC();
  
  // Initialize supabase and subscribe to clipboard
  if (initSupabase()) {
    subscribeToClipboard();
  }
  
  // Start monitoring the clipboard
  const cleanupClipboardWatch = watchClipboard();
  
  app.on('before-quit', () => {
    isQuitting = true;
    
    // Clean up resources
    cleanupClipboardWatch();
    if (clipboardSubscription) {
      clipboardSubscription.unsubscribe();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
