// This file initializes the Electron application and sets up the main process.

const { app, BrowserWindow, ipcMain, clipboard, Tray, Menu } = require('electron');
const path = require('path');
const clipboardy = require('clipboardy');
const { createClient } = require('@supabase/supabase-js');
const { encryptData, decryptData } = require('../shared/encryption');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let mainWindow;
let tray;
let userId;
let encryption_key;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        titleBarStyle: 'hidden',
        vibrancy: 'under-window',
        visualEffectState: 'active',
        transparent: true,
        frame: false
    });

    mainWindow.loadURL(
        app.isPackaged
            ? `file://${path.join(__dirname, '../build/index.html')}`
            : 'http://localhost:3000'
    );

    setupClipboardSync();
    createTray();
}

function setupClipboardSync() {
    // Set up Supabase real-time subscription for clipboard updates
    const subscription = supabase
        .channel('clipboard-updates')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'clipboard_entries',
            filter: `user_id=eq.${userId}`
        }, handleClipboardUpdate)
        .subscribe();

    // Check for clipboard updates every 2 seconds as backup
    setInterval(checkForClipboardUpdates, 2000);
}

async function handleClipboardUpdate(payload) {
    try {
        const encryptedData = payload.new.content;
        const contentType = payload.new.content_type;

        // Decrypt the data
        const decryptedData = decryptData(encryptedData, encryption_key);

        // Update the system clipboard
        if (contentType === 'text') {
            clipboardy.writeSync(decryptedData);
        } else if (contentType === 'file') {
            // Handle file clipboard operations
            // This would require additional implementation
        }

        // Notify the renderer process
        mainWindow.webContents.send('clipboard-updated', {
            timestamp: payload.new.created_at,
            content_preview: decryptedData.substring(0, 50),
            device: payload.new.device_info
        });

    } catch (error) {
        console.error('Error updating clipboard:', error);
    }
}

async function checkForClipboardUpdates() {
    const { data, error } = await supabase
        .from('clipboard_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (data && data.length > 0) {
        const latestEntry = data[0];
        handleClipboardUpdate({ new: latestEntry });
    }
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Dashboard', click: () => mainWindow.show() },
        { label: 'Pause Sync', type: 'checkbox', click: toggleSync },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Clipboard Sync');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

function toggleSync(menuItem) {
    const isPaused = menuItem.checked;
    // Implementation to pause/resume sync
    mainWindow.webContents.send('sync-status-changed', !isPaused);
}

// Handle IPC messages from renderer
ipcMain.on('set-user-details', (event, { user_id, key }) => {
    userId = user_id;
    encryption_key = key;
    setupClipboardSync();
});

ipcMain.on('copy-to-clipboard', (event, text) => {
    clipboardy.writeSync(text);
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});