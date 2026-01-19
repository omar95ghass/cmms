import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SystemSettingsContext = createContext();

export function SystemSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    systemName: 'MMS',
    systemNameArabic: 'نظام الإدارة الطبية',
    logoPath: '/logo.png',
    backupPath: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/system-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await api.put('/system-settings', newSettings);
      if (response.data.success) {
        setSettings(response.data.settings);
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating system settings:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update settings' };
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider');
  }
  return context;
}
