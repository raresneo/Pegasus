import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI, apiClient } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  debugLogin: () => Promise<void>;
  loading: boolean;
  token: string | null;
  error: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('pegasus_auth_token');
      const storedUser = localStorage.getItem('pegasus_user');

      if (storedToken && storedUser) {
        try {
          apiClient.setToken(storedToken);
          const userData = JSON.parse(storedUser);

          // Verify token is still valid by fetching current user
          const currentUser = await authAPI.me();
          setUser(currentUser);
          setToken(storedToken);
        } catch (error) {
          // Token expired or invalid, clear storage
          console.error('Auth verification failed:', error);
          localStorage.removeItem('pegasus_auth_token');
          localStorage.removeItem('pegasus_user');
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem('pegasus_auth_token', response.token);
        localStorage.setItem('pegasus_user', JSON.stringify(response.user));

        // Update API client with token
        apiClient.setToken(response.token);

        // Update state
        setToken(response.token);
        setUser(response.user);

        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    try {
      setLoading(true);
      const response = await authAPI.register(name, email, password);

      if (response.token && response.user) {
        // Auto-login after successful registration
        localStorage.setItem('pegasus_auth_token', response.token);
        localStorage.setItem('pegasus_user', JSON.stringify(response.user));

        apiClient.setToken(response.token);
        setToken(response.token);
        setUser(response.user);

        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('pegasus_auth_token');
    localStorage.removeItem('pegasus_user');
    apiClient.setToken(null);
    setToken(null);
    setUser(null);
  };

  const debugLogin = async () => {
    const mockUser: User = {
      id: 'debug-user-id',
      email: 'debug@pegasus.com',
      name: 'Debug Admin',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Debug+Admin',
      createdAt: new Date().toISOString()
    };
    const mockToken = 'debug-token-12345';

    localStorage.setItem('pegasus_auth_token', mockToken);
    localStorage.setItem('pegasus_user', JSON.stringify(mockUser));

    apiClient.setToken(mockToken);
    setToken(mockToken);
    setUser(mockUser);
    setError(null); // Clear errors on debug login
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        debugLogin,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user && !!token, // Keep isAuthenticated
        token // Keep token
      }}
    >
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
