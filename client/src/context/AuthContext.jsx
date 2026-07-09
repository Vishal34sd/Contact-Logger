import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [portalId, setPortalId] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await authApi.getStatus();
      const { data } = response;

      setIsConnected(data.isConnected);
      if (data.isConnected) {
        setPortalId(data.portalId);
        setLastSync(data.lastSync);
      } else {
        setPortalId(null);
        setLastSync(null);
      }
    } catch (error) {
      console.error('Failed to fetch auth status', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const disconnect = async () => {
    try {
      await authApi.disconnect();
      setIsConnected(false);
      setPortalId(null);
      setLastSync(null);
      toast.success('Disconnected from HubSpot');
    } catch (error) {

    }
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        portalId,
        lastSync,
        isLoading,
        disconnect,
        refreshStatus: fetchStatus,
        setIsConnected 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
