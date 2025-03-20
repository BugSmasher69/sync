import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  pairId: string | null;
  pairName: string | null;
  encryptionKey: string | null;
  setPairInfo: (pairId: string, pairName: string, key: string) => void;
  generateNewPair: () => { pairId: string, pairName: string, encryptionKey: string };
  clearPairInfo: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pairId, setPairId] = useState<string | null>(null);
  const [pairName, setPairName] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load from localStorage on startup
    const storedPairId = localStorage.getItem('pairId');
    const storedPairName = localStorage.getItem('pairName');
    const storedEncryptionKey = localStorage.getItem('encryptionKey');
    
    if (storedPairId && storedPairName && storedEncryptionKey) {
      setPairId(storedPairId);
      setPairName(storedPairName);
      setEncryptionKey(storedEncryptionKey);
      setIsAuthenticated(true);
    }
  }, []);

  const setPairInfo = (id: string, name: string, key: string) => {
    setPairId(id);
    setPairName(name);
    setEncryptionKey(key);
    setIsAuthenticated(true);
    
    localStorage.setItem('pairId', id);
    localStorage.setItem('pairName', name);
    localStorage.setItem('encryptionKey', key);
  };

  const generateNewPair = () => {
    const newPairId = uuidv4();
    const newPairName = `Device-${Math.floor(Math.random() * 10000)}`;
    const newKey = uuidv4();
    
    setPairInfo(newPairId, newPairName, newKey);
    
    return {
      pairId: newPairId,
      pairName: newPairName,
      encryptionKey: newKey
    };
  };

  const clearPairInfo = () => {
    setPairId(null);
    setPairName(null);
    setEncryptionKey(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('pairId');
    localStorage.removeItem('pairName');
    localStorage.removeItem('encryptionKey');
  };

  return (
    <AuthContext.Provider value={{
      pairId,
      pairName,
      encryptionKey,
      setPairInfo,
      generateNewPair,
      clearPairInfo,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
