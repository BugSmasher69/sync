const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    setUserDetails: (userData) => ipcRenderer.send('set-user-details', userData),
    copyToClipboard: (text) => ipcRenderer.send('copy-to-clipboard', text),
    onClipboardUpdated: (callback) => ipcRenderer.on('clipboard-updated', callback),
    onSyncStatusChanged: (callback) => ipcRenderer.on('sync-status-changed', callback)
});
