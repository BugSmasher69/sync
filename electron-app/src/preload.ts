import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Device pairing
  generatePair: () => ipcRenderer.invoke('generate-pair'),
  savePair: (pairId: string, pairName: string, encryptionKey: string) => 
    ipcRenderer.invoke('save-pair', pairId, pairName, encryptionKey),
  getPair: () => ipcRenderer.invoke('get-pair'),
  
  // Supabase configuration
  saveSupabaseConfig: (url: string, key: string) => 
    ipcRenderer.invoke('save-supabase-config', url, key),
  
  // Clipboard history
  getClipboardHistory: (limit: number = 20) => 
    ipcRenderer.invoke('get-clipboard-history', limit)
});
