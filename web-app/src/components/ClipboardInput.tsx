import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSend, FiLink, FiFile, FiClipboard } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Encryption } from 'shared';
import { SupabaseService } from 'shared';
import config from '../config';

const InputContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  padding: 1rem;
  resize: none;
  min-height: 120px;
  font-size: 1rem;
  font-family: inherit;
  
  &:focus {
    outline: none;
  }
`;

const InputActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const TypeButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TypeButton = styled(motion.button)<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(0, 120, 255, 0.1)' : 'transparent'};
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  color: ${props => props.isActive ? '#0078ff' : '#555'};
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const SendButton = styled(motion.button)`
  background: #0078ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const FileInputWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.03);
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FileName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`;

const FileSize = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const SuccessMessage = styled(motion.div)`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 200, 83, 0.1);
  color: #00c853;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

type ContentType = 'text' | 'link' | 'file';

const ClipboardInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { pairId, encryptionKey } = useAuth();
  
  const supabaseService = SupabaseService.getInstance(
    config.supabaseUrl,
    config.supabaseKey
  );
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSend = async () => {
    if (!pairId || !encryptionKey) return;
    
    setIsSending(true);
    
    try {
      let encryptedContent = '';
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileMimeType: string | undefined;
      
      if (contentType === 'file' && file) {
        // Convert file to base64 string for encryption
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        
        const fileData = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = reject;
        });
        
        encryptedContent = Encryption.encrypt(fileData, encryptionKey);
        fileName = file.name;
        fileSize = file.size;
        fileMimeType = file.type;
      } else {
        encryptedContent = Encryption.encrypt(content, encryptionKey);
      }
      
      await supabaseService.addClipboardItem({
        pair_id: pairId,
        content: encryptedContent,
        content_type: contentType,
        source_device: 'web',
        file_name: fileName,
        file_size: fileSize,
        file_mime_type: fileMimeType
      });
      
      setContent('');
      setFile(null);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending clipboard data:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <InputContainer>
      <InputWrapper>
        {contentType !== 'file' && (
          <TextArea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={contentType === 'text' 
              ? "Enter text to send to your device..." 
              : "Enter a URL to send to your device..."
            }
          />
        )}
        
        {contentType === 'file' && (
          <div style={{ padding: '1rem' }}>
            <input 
              type="file" 
              onChange={handleFileChange}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input">
              <SendButton as="span" whileHover={{ scale: 1.02 }}>
                <FiFile /> Select File
              </SendButton>
            </label>
            
            {file && (
              <FileInputWrapper>
                <FiFile />
                <FileInfo>
                  <FileName>{file.name}</FileName>
                  <FileSize>{(file.size / 1024).toFixed(2)} KB</FileSize>
                </FileInfo>
              </FileInputWrapper>
            )}
          </div>
        )}
        
        <InputActions>
          <TypeButtons>
            <TypeButton 
              isActive={contentType === 'text'}
              onClick={() => setContentType('text')}
              whileTap={{ scale: 0.95 }}
            >
              <FiClipboard />
            </TypeButton>
            <TypeButton 
              isActive={contentType === 'link'}
              onClick={() => setContentType('link')}
              whileTap={{ scale: 0.95 }}
            >
              <FiLink />
            </TypeButton>
            <TypeButton 
              isActive={contentType === 'file'}
              onClick={() => setContentType('file')}
              whileTap={{ scale: 0.95 }}
            >
              <FiFile />
            </TypeButton>
          </TypeButtons>
          
          <SendButton 
            onClick={handleSend}
            disabled={
              isSending || 
              !pairId || 
              (contentType !== 'file' && !content) || 
              (contentType === 'file' && !file)
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend /> Send
          </SendButton>
        </InputActions>
      </InputWrapper>
      
      {showSuccess && (
        <SuccessMessage
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FiClipboard /> Content sent successfully!
        </SuccessMessage>
      )}
    </InputContainer>
  );
};

export default ClipboardInput;
