import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      api.get('/auth/verify')
        .then(response => {
          if (response.data && response.data.user) {
            setUser(response.data.user);
          } else {
            // Invalid response, remove token
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Check if system is locked
      if (response.data.locked) {
        return {
          success: false,
          message: response.data.message || 'System is locked',
          locked: true
        };
      }
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      // Check if error is due to system lock
      if (error.response?.status === 403 && error.response?.data?.locked) {
        return {
          success: false,
          message: error.response.data.message || 'System is locked',
          locked: true
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
