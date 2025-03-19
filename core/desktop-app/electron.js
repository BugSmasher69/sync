// This file initializes the Electron application and sets up the main process.

const { app, BrowserWindow, ipcMain, clipboard, Tray, Menu } = require('electron');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Add electron-reload for development
if (!app.isPackaged) {
    try {
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
            hardResetMethod: 'exit'
        });
    } catch (err) {
        console.warn('electron-reload not installed or failed to load:', err.message);
    }
}

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('Error loading .env file:', result.error);
    }
} else {
    console.warn('.env file not found. Using fallback configuration.');
}

// Supabase configuration with fallback values
const supabaseUrl = process.env.SUPABASE_URL || 'https://kxsnmfwjfaseiqiuulgl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c25tZndqZmFzZWlxaXV1bGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMTczNzcsImV4cCI6MjA1Nzg5MzM3N30.DC1UgmQCLv7pXqytPM6fWfOtFTdpgDiAx4fA_Mgae3g';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Try to load encryption module - handle if path is incorrect
let encryptData, decryptData;
try {
    const encryption = require('./src/renderer/shared/encryption');
    encryptData = encryption.encryptData;
    decryptData = encryption.decryptData;
} catch (error) {
    console.error('Error loading encryption module:', error.message);
    // Provide dummy implementations as fallback
    encryptData = (data) => data;
    decryptData = (data) => data;
}

let mainWindow;
let tray;
let userId;
let encryption_key;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            // More secure settings
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
        },
        titleBarStyle: 'hidden',
        vibrancy: 'under-window',
        visualEffectState: 'active',
        transparent: true,
        frame: false
    });

    // Better error handling for window loading
    const startUrl = process.env.ELECTRON_START_URL ||
        (app.isPackaged
            ? `file://${path.join(__dirname, '../build/index.html')}`
            : 'http://localhost:3001');

    console.log('Loading application from:', startUrl);

    mainWindow.loadURL(startUrl)
        .catch(err => {
            console.error('Failed to load application:', err);
        });

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded successfully');
    });

    createTray();
}

function setupClipboardSync() {
    if (!userId) {
        console.log('No user ID provided, clipboard sync not started');
        return;
    }

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

        // Update the system clipboard using Electron's native clipboard API
        if (contentType === 'text' || contentType === 'link') {
            clipboard.writeText(decryptedData);
        } else if (contentType === 'file') {
            // Handle file clipboard operations
            console.log('File received, handling not fully implemented');
        }

        // Notify the renderer process
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('clipboard-updated', {
                timestamp: payload.new.created_at,
                content_preview: typeof decryptedData === 'string' ? decryptedData.substring(0, 50) : 'File data',
                device: payload.new.device_info
            });
        }

    } catch (error) {
        console.error('Error updating clipboard:', error);
    }
}

async function checkForClipboardUpdates() {
    if (!userId) return;

    try {
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
    } catch (error) {
        console.error('Error checking clipboard updates:', error);
    }
}

function createTray() {
    try {
        // Use a proper default icon from Electron's resources
        let iconPath = path.join(__dirname, 'assets', 'tray-icon.png');

        // Better fallback icon handling
        if (!fs.existsSync(iconPath)) {
            iconPath = path.join(__dirname, 'assets', 'default-icon.png');
            console.warn('Tray icon not found, using default icon');
        }

        tray = new Tray(iconPath);
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
    } catch (error) {
        console.error('Error creating tray:', error);
    }
}

function toggleSync(menuItem) {
    const isPaused = menuItem.checked;
    // Implementation to pause/resume sync
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('sync-status-changed', !isPaused);
    }
}

// Handle IPC messages from renderer
ipcMain.on('set-user-details', (event, { user_id, key }) => {
    userId = user_id;
    encryption_key = key;
    setupClipboardSync();
});

ipcMain.on('copy-to-clipboard', (event, text) => {
    clipboard.writeText(text);
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