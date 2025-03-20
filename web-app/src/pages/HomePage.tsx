import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiClipboard, FiLink, FiFile, FiClock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ClipboardInput from '../components/ClipboardInput';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled(motion.h1)`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
  margin-top: 2rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  color: #0078ff;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/setup');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null; // Will redirect to setup
  }
  
  return (
    <HomeContainer>
      <WelcomeSection>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Sync Your Clipboard Across Devices
        </Title>
        <Subtitle>
          Copy on one device, paste on another. Securely encrypted and always in sync.
        </Subtitle>
      </WelcomeSection>
      
      <ClipboardInput />
      
      <FeatureGrid>
        <FeatureCard
          whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <FeatureIcon>
            <FiClipboard />
          </FeatureIcon>
          <FeatureTitle>Text Sync</FeatureTitle>
          <FeatureDescription>
            Seamlessly sync text between your devices with end-to-end encryption.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard
          whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <FeatureIcon>
            <FiLink />
          </FeatureIcon>
          <FeatureTitle>Link Sharing</FeatureTitle>
          <FeatureDescription>
            Share links instantly across all your connected devices.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard
          whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <FeatureIcon>
            <FiFile />
          </FeatureIcon>
          <FeatureTitle>File Transfer</FeatureTitle>
          <FeatureDescription>
            Quickly transfer files between devices with secure encryption.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </HomeContainer>
  );
};

export default HomePage;
