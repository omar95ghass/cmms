import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import Button from '../Button/Button';

function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { settings } = useSystemSettings();

  return (
    <div className="min-h-screen bg-medical-light flex relative">
      {/* Sidebar - Part of page flow */}
      <Sidebar />

      {/* Main Content - Takes remaining space */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-medical-card border-b border-medical-border shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity hidden sm:flex">
                  <img 
                    src={settings.logoPath || '/logo.png'} 
                    alt={settings.systemName || 'MMS'} 
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </Link>
                <h1 className="text-lg sm:text-xl font-bold text-primary-600">
                  <span className="hidden sm:inline">{t('common.welcome')} - </span>
                  {t(`roles.${user?.role}`)}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <span className="text-sm text-medical-muted hidden sm:inline">{user?.username}</span>
                <Button variant="secondary" onClick={logout} className="text-sm" icon="fa-sign-out-alt">
                  {t('common.logout')}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Footer - Fixed at bottom, extends only in content area (excluding sidebar) */}
      <Footer />
    </div>
  );
}

export default Layout;
