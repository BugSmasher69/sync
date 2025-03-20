import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClipboard, FiFile, FiLink, FiExternalLink, FiClock, FiCopy, FiSearch } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { SupabaseService, ClipboardItem, Encryption } from 'shared';
import config from '../config';

const HistoryContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
`;

const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #0078ff;
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const TypeBadge = styled.div<{ type: 'text' | 'link' | 'file' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  
  color: ${props => {
    switch(props.type) {
      case 'text': return '#0078ff';
      case 'link': return '#7209b7';
      case 'file': return '#f77f00';
      default: return '#333';
    }
  }};
`;

const HistoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
`;

const HistoryContent = styled.div`
  padding: 1rem;
`;

const TextContent = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
`;

const LinkContent = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #7209b7;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FileContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: #f77f00;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
`;

const FileSize = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #555;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
  color: #999;
  margin-bottom: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(0, 120, 255, 0.1);
  border-top-color: #0078ff;
`;

interface DecryptedClipboardItem extends ClipboardItem {
  decryptedContent: string;
}

const HistoryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clipboardItems, setClipboardItems] = useState<DecryptedClipboardItem[]>([]);
  const { isAuthenticated, pairId, encryptionKey } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/setup');
      return;
    }
    
    const fetchClipboardHistory = async () => {
      if (!pairId || !encryptionKey) return;
      
      try {
        setIsLoading(true);
        
        const supabaseService = SupabaseService.getInstance(
          config.supabaseUrl,
          config.supabaseKey
        );
        
        const items = await supabaseService.getClipboardHistory(pairId, 50);
        
        // Decrypt items
        const decryptedItems = items.map(item => {
          try {
            return {
              ...item,
              decryptedContent: Encryption.decrypt(item.content, encryptionKey!)
            };
          } catch (e) {
            return {
              ...item,
              decryptedContent: 'Unable to decrypt content'
            };
          }
        });
        
        setClipboardItems(decryptedItems);
      } catch (error) {
        console.error('Error fetching clipboard history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClipboardHistory();
  }, [isAuthenticated, navigate, pairId, encryptionKey]);
  
  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const getIconForContentType = (type: string) => {
    switch (type) {
      case 'text': return <FiClipboard />;
      case 'link': return <FiLink />;
      case 'file': return <FiFile />;
      default: return <FiClipboard />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Text';
      case 'link': return 'Link';
      case 'file': return 'File';
      default: return type;
    }
  };
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  const filteredItems = searchTerm
    ? clipboardItems.filter(item => 
        item.decryptedContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.file_name && item.file_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : clipboardItems;
  
  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }
  
  return (
    <HistoryContainer>
      <PageHeader>
        <Title>Clipboard History</Title>
        <Subtitle>View and manage your previously synced clipboard items</Subtitle>
      </PageHeader>
      
      <SearchContainer>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search clipboard history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
          />
        </LoadingContainer>
      ) : filteredItems.length > 0 ? (
        <HistoryList>
          <AnimatePresence>
            {filteredItems.map(item => (
              <HistoryCard
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HistoryHeader>
                  <TypeBadge type={item.content_type as 'text' | 'link' | 'file'}>
                    {getIconForContentType(item.content_type)}
                    {getTypeLabel(item.content_type)}
                  </TypeBadge>
                  <HistoryMeta>
                    <FiClock /> {formatDate(item.created_at)}
                  </HistoryMeta>
                </HistoryHeader>
                
                <HistoryContent>
                  {item.content_type === 'text' && (
                    <TextContent>
                      {item.decryptedContent.length > 300 
                        ? item.decryptedContent.substring(0, 300) + '...' 
                        : item.decryptedContent
                      }
                      <ActionButton 
                        onClick={() => handleCopyToClipboard(item.decryptedContent)}
                        title="Copy to clipboard"
                      >
                        <FiCopy />
                      </ActionButton>
                    </TextContent>
                  )}
                  
                  {item.content_type === 'link' && (
                    <LinkContent href={item.decryptedContent} target="_blank" rel="noopener noreferrer">
                      {item.decryptedContent}
                      <FiExternalLink />
                    </LinkContent>
                  )}
                  
                  {item.content_type === 'file' && (
                    <FileContent>
                      <FileIcon>
                        <FiFile />
                      </FileIcon>
                      <FileInfo>
                        <FileName>{item.file_name}</FileName>
                        <FileSize>{formatFileSize(item.file_size)}</FileSize>
                      </FileInfo>
                    </FileContent>
                  )}
                </HistoryContent>
              </HistoryCard>
            ))}
          </AnimatePresence>
        </HistoryList>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <FiClipboard />
          </EmptyIcon>
          <EmptyText>
            {searchTerm 
              ? 'No clipboard items match your search'
              : 'Your clipboard history is empty'
            }
          </EmptyText>
        </EmptyState>
      )}
    </HistoryContainer>
  );
};

export default HistoryPage;
