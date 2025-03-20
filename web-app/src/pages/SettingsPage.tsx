import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSave, FiRefreshCw, FiInfo, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const SettingsContainer = styled.div`
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

const SettingsCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #0078ff;
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.1);
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const PairedDeviceInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.95rem;
  color: #666;
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Button = styled(motion.button)`
  background: #0078ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &.secondary {
    background: #666;
  }
  
  &.danger {
    background: #ff3860;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Notification = styled(motion.div)<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(0, 200, 83, 0.1)';
      case 'error': return 'rgba(255, 56, 96, 0.1)';
      case 'info': return 'rgba(0, 120, 255, 0.1)';
    }
  }};
  
  color: ${props => {
    switch (props.type) {
      case 'success': return '#00c853';
      case 'error': return '#ff3860';
      case 'info': return '#0078ff';
    }
  }};
`;

const NotificationText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
`;

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const SettingsPage: React.FC = () => {
  const { isAuthenticated, pairId, pairName, encryptionKey, clearPairInfo, generateNewPair } = useAuth();
  const navigate = useNavigate();
  
  const [deviceName, setDeviceName] = useState(pairName || '');
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });
  
  if (!isAuthenticated) {
    navigate('/setup');
    return null;
  }
  
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  const handleResetPairing = () => {
    if (window.confirm('Are you sure you want to reset your device pairing? This will disconnect from all synced devices.')) {
      clearPairInfo();
      navigate('/setup');
    }
  };
  
  const handleGenerateNewPair = () => {
    if (window.confirm('This will create a new pairing and disconnect from your current devices. Continue?')) {
      generateNewPair();
      showNotification('New pairing generated successfully.', 'success');
    }
  };
  
  return (
    <SettingsContainer>
      <PageHeader>
        <Title>Settings</Title>
        <Subtitle>Configure your clipboard synchronization preferences</Subtitle>
      </PageHeader>
      
      {notification.show && (
        <Notification 
          type={notification.type}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <NotificationText>
            <FiInfo /> {notification.message}
          </NotificationText>
          <CloseButton onClick={() => setNotification(prev => ({ ...prev, show: false }))}>
            <FiX />
          </CloseButton>
        </Notification>
      )}
      
      <SettingsCard>
        <SectionTitle>Device Pairing</SectionTitle>
        
        <PairedDeviceInfo>
          <InfoRow>
            <InfoLabel>Device Name</InfoLabel>
            <InfoValue>{pairName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Pair ID</InfoLabel>
            <InfoValue>{pairId}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Encryption Key</InfoLabel>
            <InfoValue>{encryptionKey ? '••••••••••••••••' : 'Not available'}</InfoValue>
          </InfoRow>
        </PairedDeviceInfo>
        
        <FormGroup>
          <Label htmlFor="deviceName">Change Device Name</Label>
          <Input 
            id="deviceName"
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Enter a new name for this device"
          />
        </FormGroup>
        
        <ButtonGroup>
          <Button
            className="danger"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResetPairing}
          >
            Reset Pairing
          </Button>
          
          <Button
            className="secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateNewPair}
          >
            <FiRefreshCw /> Generate New Pair
          </Button>
          
          <Button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!deviceName || deviceName === pairName}
            onClick={() => {
              // Would normally save the device name here
              showNotification('Device name updated successfully', 'success');
            }}
          >
            <FiSave /> Save Changes
          </Button>
        </ButtonGroup>
      </SettingsCard>
      
      <SettingsCard>
        <SectionTitle>Preferences</SectionTitle>
        
        <FormGroup>
          <Label>
            <input type="checkbox" defaultChecked={true} />
            {' '}Automatically copy received items to clipboard
          </Label>
        </FormGroup>
        
        <FormGroup>
          <Label>
            <input type="checkbox" defaultChecked={true} />
            {' '}Show notifications for new clipboard items
          </Label>
        </FormGroup>
        
        <FormGroup>
          <Label>
            <input type="checkbox" defaultChecked={true} />
            {' '}Start synchronization on app launch
          </Label>
        </FormGroup>
      </SettingsCard>
    </SettingsContainer>
  );
};

export default SettingsPage;
