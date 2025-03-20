import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiClock, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const NavContainer = styled.nav`
  display: flex;
  justify-content: center;
  background: white;
  margin: 1rem auto;
  width: fit-content;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
    color: #333;
    text-decoration: none;
  }
  
  &.active {
    background: rgba(0, 120, 255, 0.1);
    color: #0078ff;
  }
`;

const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <NavContainer>
      <NavItem to="/" end>
        <FiHome /> Home
      </NavItem>
      <NavItem to="/history">
        <FiClock /> History
      </NavItem>
      <NavItem to="/settings">
        <FiSettings /> Settings
      </NavItem>
    </NavContainer>
  );
};

export default Navigation;
