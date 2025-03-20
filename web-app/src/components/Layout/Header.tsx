import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiLogOut, FiSettings } from 'react-icons/fi';
import config from '../../config';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const IconButton = styled(motion.button)`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  padding: 0.5rem;
  border-radius: 50%;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000;
  }
`;

const Header: React.FC = () => {
  const { isAuthenticated, clearPairInfo } = useAuth();
  
  return (
    <HeaderContainer>
      <Logo
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {config.appName}
      </Logo>
      
      {isAuthenticated && (
        <Actions>
          <IconButton
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSettings />
          </IconButton>
          <IconButton
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearPairInfo}
          >
            <FiLogOut />
          </IconButton>
        </Actions>
      )}
    </HeaderContainer>
  );
};

export default Header;
