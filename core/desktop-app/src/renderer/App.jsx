import React, { useState, useEffect, useCallback } from 'react';
import { ipcRenderer } from 'electron';
import { createClient } from '@supabase/supabase-js';
import {
  Container, Sidebar, SidebarSection, SidebarItem, Content, Header, 
  SearchBar, HeaderButton, EmptyState, ThreeDotMenu, SectionHeader, ViewOptions, 
  MainContent, ClipboardGrid, ClipboardItem, ToastContainer
} from './components';
import { encryptData, generateEncryptionKey } from './shared/encryption';
import './App.css';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [session, setSession] = useState(null);
  const [clipboardItems, setClipboardItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState('all');
  const [isSyncing, setSyncing] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [toasts, setToasts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        
        // Retrieve encryption key from secure storage
        const storedKey = localStorage.getItem(`encryption_key_${session.user.id}`);
        if (storedKey) {
          setEncryptionKey(storedKey);
          
          // Send user details to main process
          ipcRenderer.send('set-user-details', {
            user_id: session.user.id,
            key: storedKey
          });
          
          // Load clipboard history
          loadClipboardHistory();
        } else {
          // Handle first-time setup or key retrieval
          showToast('warning', 'Encryption Key Required', 'Please set up your encryption key');
        }
      }
    };
    
    checkSession();
    
    // Listen for clipboard updates from main process
    ipcRenderer.on('clipboard-updated', handleClipboardUpdate);
    
    ipcRenderer.on('sync-status-changed', (event, status) => {
      setSyncing(status);
      showToast(
        status ? 'success' : 'warning', 
        status ? 'Sync Enabled' : 'Sync Paused', 
        status ? 'Clipboard sync is now active' : 'Clipboard sync has been paused'
      );
    });
    
    return () => {
      ipcRenderer.removeAllListeners('clipboard-updated');
      ipcRenderer.removeAllListeners('sync-status-changed');
    };
  }, []);
  
  const showToast = (type, title, message) => {
    const id = Date.now();
    const toast = { id, type, title, message, onClose: () => removeToast(id) };
    setToasts(prevToasts => [...prevToasts, toast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };
  
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  const handleClipboardUpdate = useCallback((event, newItem) => {
    setClipboardItems(prevItems => {
      // Check if the item already exists to avoid duplicates
      const exists = prevItems.some(item => 
        item.content_preview === newItem.content_preview && 
        Math.abs(new Date(item.timestamp) - new Date(newItem.timestamp)) < 1000
      );
      
      if (exists) return prevItems;
      
      // Add the new item with a "new" flag for animation
      const updatedItem = {...newItem, isNew: true};
      
      // After 2 seconds, remove the "new" flag
      setTimeout(() => {
        setClipboardItems(items => 
          items.map(item => 
            item.timestamp === newItem.timestamp 
              ? {...item, isNew: false} 
              : item
          )
        );
      }, 2000);
      
      return [updatedItem, ...prevItems];
    });
    
    // Show a subtle toast
    showToast('info', 'Clipboard Updated', 'New content added to clipboard');
  }, []);
  
  const loadClipboardHistory = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('clipboard_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
        
      if (data) {
        // Decrypt content previews for display
        const decryptedItems = data.map(item => ({
          id: item.id,
          content_type: item.content_type,
          device_info: item.device_info,
          timestamp: item.created_at,
          content_preview: getContentPreview(item, encryptionKey)
        }));
        
        setClipboardItems(decryptedItems);
      }
    } catch (error) {
      console.error('Error loading clipboard history:', error);
      showToast('error', 'Load Failed', 'Could not load clipboard history');
    }
  };
  
  const getContentPreview = (item, key) => {
    try {
      if (item.content_type === 'file') {
        const decrypted = JSON.parse(decryptData(item.content, key));
        return `File: ${decrypted.name || 'Unknown'}`;
      } else {
        const decrypted = decryptData(item.content, key);
        return typeof decrypted === 'string' ? decrypted.substring(0, 150) : String(decrypted);
      }
    } catch (err) {
      console.error('Error decrypting content:', err);
      return '[Encrypted Content]';
    }
  };
  
  const copyToClipboard = (itemId) => {
    // Find the item
    const item = clipboardItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Indicate copying in progress
    showToast('info', 'Copying', 'Copying to clipboard...');
    
    // Send to main process to update system clipboard
    ipcRenderer.send('copy-to-clipboard', item.content_preview);
    
    // Show success toast
    setTimeout(() => {
      showToast('success', 'Copied', 'Content copied to clipboard');
    }, 500);
  };
  
  const deleteItem = async (itemId) => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('clipboard_entries')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      setClipboardItems(items => items.filter(item => item.id !== itemId));
      showToast('success', 'Deleted', 'Item removed from clipboard history');
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('error', 'Delete Failed', 'Could not delete the item');
    }
  };
  
  const toggleSyncStatus = () => {
    ipcRenderer.send('toggle-sync');
  };
  
  const clearHistory = async () => {
    if (!session || !window.confirm('Are you sure you want to clear all clipboard history?')) return;
    
    try {
      const { error } = await supabase
        .from('clipboard_entries')
        .delete()
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      setClipboardItems([]);
      showToast('success', 'History Cleared', 'Clipboard history has been cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      showToast('error', 'Clear Failed', 'Could not clear clipboard history');
    }
  };
  
  const filteredItems = clipboardItems
    .filter(item => {
      // Filter by search query
      if (searchQuery && !item.content_preview.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by selected view
      if (selectedView === 'text' && item.content_type !== 'text') return false;
      if (selectedView === 'files' && item.content_type !== 'file') return false;
      if (selectedView === 'links' && !item.content_preview.includes('http')) return false;
      
      return true;
    });
  
  return (
    <Container>
      <Sidebar>
        <SidebarSection>
          <SidebarItem 
            icon="clipboard" 
            label="All Items" 
            selected={selectedView === 'all'}
            onClick={() => setSelectedView('all')}
          />
          <SidebarItem 
            icon="text" 
            label="Text" 
            selected={selectedView === 'text'}
            onClick={() => setSelectedView('text')}
          />
          <SidebarItem 
            icon="file" 
            label="Files" 
            selected={selectedView === 'files'}
            onClick={() => setSelectedView('files')}
          />
          <SidebarItem 
            icon="link" 
            label="Links" 
            selected={selectedView === 'links'}
            onClick={() => setSelectedView('links')}
          />
        </SidebarSection>
        
        <SidebarSection title="Options">
          <SidebarItem 
            icon="history"
            label="Recent Items"
            selected={false}
            onClick={() => loadClipboardHistory()}
          />
          <SidebarItem 
            icon="delete"
            label="Clear History"
            selected={false}
            onClick={clearHistory}
          />
        </SidebarSection>
        
        <div className="sidebar-spacer"></div>
        
        <SidebarSection>
          <SidebarItem 
            icon={isSyncing ? "sync" : "sync-off"} 
            label={isSyncing ? "Sync Active" : "Sync Paused"}
            onClick={toggleSyncStatus}
          />
          <SidebarItem 
            icon="settings" 
            label="Settings" 
            onClick={() => {/* Open settings */}}
          />
        </SidebarSection>
      </Sidebar>
      
      <Content>
        <Header>
          <SearchBar 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clipboard history..."
          />
          
          <div className="header-actions">
            <HeaderButton 
              icon="refresh" 
              onClick={loadClipboardHistory} 
              tooltip="Refresh"
            />
            <HeaderButton 
              icon={viewMode === 'grid' ? 'list' : 'grid'} 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} 
              tooltip={viewMode === 'grid' ? 'List View' : 'Grid View'}
            />
          </div>
        </Header>
        
        <MainContent>
          <SectionHeader title="Clipboard History">
            <ViewOptions 
              options={[
                { value: 'recent', label: 'Recent' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'size', label: 'Size' }
              ]}
              activeView="recent"
              onChange={(view) => {/* implement sorting */}}
            />
          </SectionHeader>
          
          {filteredItems.length > 0 ? (
            <ClipboardGrid>
              {filteredItems.map(item => (
                <ClipboardItem
                  key={item.id}
                  content={item.content_preview}
                  timestamp={item.timestamp}
                  device={item.device_info}
                  type={item.content_type}
                  onCopy={() => copyToClipboard(item.id)}
                  menu={
                    <ThreeDotMenu options={[
                      { label: 'Copy', icon: '📋', action: () => copyToClipboard(item.id) },
                      { label: 'Delete', icon: '🗑️', action: () => deleteItem(item.id) },
                      { label: 'Share', icon: '📤', action: () => {/* Share implementation */} }
                    ]} />
                  }
                />
              ))}
            </ClipboardGrid>
          ) : (
            <EmptyState 
              message={searchQuery ? "No results found" : "Your clipboard history is empty"}
              description={searchQuery ? "Try a different search term" : "Items copied to your clipboard will appear here"}
              icon="📋"
            />
          )}
        </MainContent>
      </Content>
      
      <ToastContainer toasts={toasts} />
    </Container>
  );
};

export default App;