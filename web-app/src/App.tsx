import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import SetupPage from './pages/SetupPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f7;
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 1rem;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Header />
          <Navigation />
          <ContentContainer>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ContentContainer>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
