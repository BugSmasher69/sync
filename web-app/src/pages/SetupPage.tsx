import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLock, FiKey, FiInfo, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const SetupContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const SetupCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'white' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#0078ff' : 'transparent'};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#0078ff' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.active ? '#0078ff' : '#333'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #0078ff;
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.1);
  }
`;

const Button = styled(motion.button)`
  background: #0078ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ResultCard = styled(motion.div)`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #0078ff;
`;

const ResultField = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ResultLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const ResultValue = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  word-break: break-all;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.5rem;
  border-radius: 4px;
`;

const InfoBox = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 120, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  svg {
    color: #0078ff;
    margin-top: 0.25rem;
  }
`;

const InfoText = styled.div`
  font-size: 0.9rem;
  color: #333;
`;

enum SetupTab {
  CREATE = 'create',
  JOIN = 'join'
}

const SetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SetupTab>(SetupTab.CREATE);
  const [pairId, setPairId] = useState('');
  const [pairName, setPairName] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [generatedPairInfo, setGeneratedPairInfo] = useState<{
    pairId: string;
    pairName: string;
    encryptionKey: string;
  } | null>(null);
  
  const { isAuthenticated, generateNewPair, setPairInfo } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleCreatePair = () => {
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const newPair = generateNewPair();
      setGeneratedPairInfo(newPair);
      setSetupComplete(true);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleJoinPair = () => {
    if (!pairId || !pairName || !encryptionKey) return;
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setPairInfo(pairId, pairName, encryptionKey);
      setSetupComplete(true);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <SetupContainer>
      <SetupCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Title>Get Started with ClipSync</Title>
        <Description>
          Connect your devices to enable secure clipboard synchronization. 
          You can either create a new connection or join an existing one.
        </Description>
        
        <TabsContainer>
          <Tab
            active={activeTab === SetupTab.CREATE}
            onClick={() => setActiveTab(SetupTab.CREATE)}
          >
            Create New
          </Tab>
          <Tab
            active={activeTab === SetupTab.JOIN}
            onClick={() => setActiveTab(SetupTab.JOIN)}
          >
            Join Existing
          </Tab>
        </TabsContainer>
        
        {activeTab === SetupTab.CREATE && (
          <>
            <FormGroup>
              <Button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreatePair}
                disabled={isLoading}
              >
                <FiPlus /> Create New Connection
              </Button>
            </FormGroup>
            
            <InfoBox>
              <FiInfo size={20} />
              <InfoText>
                Creating a new connection will generate a unique ID and encryption key. 
                Save these details to connect other devices.
              </InfoText>
            </InfoBox>
            
            {generatedPairInfo && (
              <ResultCard
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <ResultField>
                  <ResultLabel>Pair ID (Share with other devices)</ResultLabel>
                  <ResultValue>{generatedPairInfo.pairId}</ResultValue>
                </ResultField>
                <ResultField>
                  <ResultLabel>Encryption Key (Keep secure)</ResultLabel>
                  <ResultValue>{generatedPairInfo.encryptionKey}</ResultValue>
                </ResultField>
                <InfoBox>
                  <FiLock size={20} />
                  <InfoText>
                    Please save this information securely. You'll need both the Pair ID and 
                    Encryption Key to connect other devices.
                  </InfoText>
                </InfoBox>
              </ResultCard>
            )}
          </>
        )}
        
        {activeTab === SetupTab.JOIN && (
          <>
            <FormGroup>
              <Label htmlFor="pairId">Pair ID</Label>
              <Input
                id="pairId"
                type="text"
                value={pairId}
                onChange={(e) => setPairId(e.target.value)}
                placeholder="Enter the pair ID provided by another device"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                type="text"
                value={pairName}
                onChange={(e) => setPairName(e.target.value)}
                placeholder="Name this device (e.g., My Phone)"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="encryptionKey">Encryption Key</Label>
              <Input
                id="encryptionKey"
                type="password"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="Enter the encryption key"
              />
            </FormGroup>
            
            <FormGroup>
              <Button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinPair}
                disabled={isLoading || !pairId || !pairName || !encryptionKey}
              >
                <FiKey /> Join Connection
              </Button>
            </FormGroup>
            
            <InfoBox>
              <FiInfo size={20} />
              <InfoText>
                To join an existing connection, you need the Pair ID and Encryption Key from 
                the device that created the connection.
              </InfoText>
            </InfoBox>
          </>
        )}
      </SetupCard>
    </SetupContainer>
  );
};

export default SetupPage;
