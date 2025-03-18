import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { encryptData, generateEncryptionKey } from '../../shared/encryption';
import { 
  Header, Footer, Tabs, TabContent, TextInput, LinkInput, 
  FileUpload, ClipboardHistory, LoginForm, ToastContainer 
} from './components';
import './App.css';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [session, setSession] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        
        // Retrieve encryption key from secure storage or user input
        const storedKey = localStorage.getItem(`encryption_key_${session.user.id}`);
        if (storedKey) {
          setEncryptionKey(storedKey);
          
          // Load clipboard history
          loadClipboardHistory();
        }
      }
    };
    
    checkSession();
    
    // Get device info
    setDeviceInfo(navigator.userAgent);
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

  const loadClipboardHistory = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('clipboard_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('device_info', deviceInfo)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
        
      if (data) {
        // Format data for display
        const formattedData = data.map(item => ({
          ...item,
          content_preview: item.content_type === 'text' 
            ? item.content.substring(0, 100) 
            : item.content_type === 'link'
              ? item.content
              : `File: ${item.metadata?.filename || 'Unknown'}`
        }));
        
        setHistory(formattedData);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      showToast('error', 'Error', 'Failed to load clipboard history');
    }
  };

  const handleTextSend = async () => {
    if (!textInput.trim() || !session) return;
    
    setIsSending(true);
    
    try {
      // Encrypt the text
      const encryptedText = encryptData(textInput, encryptionKey);
      
      // Send to Supabase
      const { data, error } = await supabase
        .from('clipboard_entries')
        .insert([{
          user_id: session.user.id,
          content: encryptedText,
          content_type: 'text',
          device_info: deviceInfo,
          metadata: {
            size: textInput.length
          }
        }]);
        
      if (error) throw error;
      
      // Update local history
      setHistory(prev => [{
        id: crypto.randomUUID(),
        content_preview: textInput.substring(0, 100),
        created_at: new Date().toISOString(),
        content_type: 'text'
      }, ...prev]);
      
      // Clear input
      setTextInput('');
      
      // Show success toast
      showToast('success', 'Text Sent', 'Text was copied to your clipboard');
      
    } catch (error) {
      console.error('Error sending text:', error);
      showToast('error', 'Error', 'Failed to send text. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleLinkSend = async () => {
    if (!linkInput.trim() || !session) return;
    
    setIsSending(true);
    
    try {
      // Encrypt the link
      const encryptedLink = encryptData(linkInput, encryptionKey);
      
      // Send to Supabase
      const { data, error } = await supabase
        .from('clipboard_entries')
        .insert([{
          user_id: session.user.id,
          content: encryptedLink,
          content_type: 'link',
          device_info: deviceInfo,
          metadata: {
            url: linkInput,
            domain: new URL(linkInput).hostname
          }
        }]);
        
      if (error) throw error;
      
      // Update local history
      setHistory(prev => [{
        id: crypto.randomUUID(),
        content_preview: linkInput,
        created_at: new Date().toISOString(),
        content_type: 'link'
      }, ...prev]);
      
      // Clear input
      setLinkInput('');
      
      // Show success toast
      showToast('success', 'Link Sent', 'Link was copied to your clipboard');
      
    } catch (error) {
      console.error('Error sending link:', error);
      showToast('error', 'Error', 'Failed to send link. Please check URL format and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (file, sendNow = false) => {
    if (!file) return;
    
    setSelectedFile(file);
    
    if (sendNow) {
      setIsSending(true);
      
      try {
        // Read file as data URL
        const fileData = await readFileAsDataURL(file);
        
        // Encrypt the file data
        const encryptedData = encryptData({
          name: file.name,
          type: file.type,
          data: fileData
        }, encryptionKey);
        
        // Send to Supabase
        const { data, error } = await supabase
          .from('clipboard_entries')
          .insert([{
            user_id: session.user.id,
            content: encryptedData,
            content_type: 'file',
            device_info: deviceInfo,
            metadata: {
              filename: file.name,
              size: file.size,
              type: file.type
            }
          }]);
          
        if (error) throw error;
        
        // Update local history
        setHistory(prev => [{
          id: crypto.randomUUID(),
          content_preview: `File: ${file.name}`,
          created_at: new Date().toISOString(),
          content_type: 'file'
        }, ...prev]);
        
        // Clear selected file
        setSelectedFile(null);
        
        // Show success toast
        showToast('success', 'File Sent', 'File was sent to your clipboard');
        
      } catch (error) {
        console.error('Error sending file:', error);
        showToast('error', 'Error', 'Failed to send file. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      reader.readAsDataURL(file);
    });
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleLogin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setSession(data.session);
      
      // For demo purposes, generate and store a key
      // In production, you would derive this from the user's password or have them input a separate passphrase
      const key = generateEncryptionKey();
      localStorage.setItem(`encryption_key_${data.session.user.id}`, key);
      setEncryptionKey(key);
      
      showToast('success', 'Logged In', 'You have successfully logged in');
      loadClipboardHistory();
    } catch (error) {
      console.error('Login error:', error);
      showToast('error', 'Login Failed', error.message || 'Please check your credentials and try again');
      throw error;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setHistory([]);
    showToast('info', 'Logged Out', 'You have been logged out');
  };

  const handleHistoryItemClick = (item) => {
    // Different handling based on content type
    switch (item.content_type) {
      case 'text':
        setTextInput(item.content_preview);
        setActiveTab('text');
        break;
      case 'link':
        setLinkInput(item.content_preview);
        setActiveTab('link');
        break;
      case 'file':
        // Can't really re-upload an existing file, just show info
        showToast('info', 'File Selected', 'This is a previously sent file');
        break;
      default:
        break;
    }
  };

  // If not logged in, show login form
  if (!session) {
    return (
      <div className="app">
        <Header />
        <LoginForm onLogin={handleLogin} />
        <Footer />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <main>
        <div className="send-container">
          <div className="send-container-header">
            <h2 className="send-container-title">Send to Clipboard</h2>
            <p className="send-container-subtitle">
              Content will be securely transmitted to your devices with end-to-end encryption
            </p>
          </div>
          
          <Tabs 
            tabs={[
              { id: 'text', label: 'Text', icon: '📝' },
              { id: 'link', label: 'Link', icon: '🔗' },
              { id: 'file', label: 'File', icon: '📄' }
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          <TabContent id="text" activeTab={activeTab}>
            <TextInput 
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onSend={handleTextSend}
              disabled={isSending}
            />
          </TabContent>
          
          <TabContent id="link" activeTab={activeTab}>
            <LinkInput 
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              onSend={handleLinkSend}
              disabled={isSending}
            />
          </TabContent>
          
          <TabContent id="file" activeTab={activeTab}>
            <FileUpload 
              onFileSelected={handleFileUpload}
              disabled={isSending}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />
          </TabContent>
        </div>
        
        <ClipboardHistory 
          items={history} 
          onItemClick={handleHistoryItemClick}
        />
      </main>
      
      <Footer />
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default App;