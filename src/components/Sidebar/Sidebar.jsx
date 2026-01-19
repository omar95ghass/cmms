import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings } = useSystemSettings();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Define menu items based on user role
  const menuItems = [];

  // Common items for all roles
  menuItems.push(
    { path: '/', label: t('dashboard.title'), icon: 'fa-chart-line' },
    { path: '/patients', label: t('patient.patientList'), icon: 'fa-users' }
  );

  // Admin: All permissions
  if (user?.role === 'admin') {
    menuItems.push(
      { path: '/patients/new', label: t('patient.addPatient'), icon: 'fa-user-plus' },
      { path: '/activity-log', label: t('activityLog.title'), icon: 'fa-clipboard-list' },
      { type: 'divider' },
      { path: '/admin/users', label: t('admin.manageUsers') || 'إدارة المستخدمين', icon: 'fa-users-cog' },
      { path: '/admin/laboratory-tests', label: t('admin.manageTests') || 'إدارة التحاليل الطبية', icon: 'fa-vial' },
      { path: '/admin/settings', label: t('admin.systemSettings') || 'إعدادات النظام', icon: 'fa-cog' }
    );
  }

  // Reception: Add patients
  if (user?.role === 'reception') {
    menuItems.push(
      { path: '/patients/new', label: t('patient.addPatient'), icon: 'fa-user-plus' }
    );
  }

  // Note: Medical Report link is available in PatientDetails page, not in sidebar

  return (
    <aside className={`bg-medical-card border-l border-medical-border shadow-lg transition-all duration-300 h-screen sticky top-0 ${
      isOpen ? 'w-64' : 'w-20'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-4 top-4 bg-primary-600 text-white p-2 rounded-l-lg hover:bg-primary-700 transition-colors flex items-center justify-center w-8 h-8 z-10"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <i className={`fas ${isOpen ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
      </button>

      {/* Sidebar Content */}
      <div className="flex flex-col h-screen overflow-y-auto">
        {/* Logo/Title */}
        <div className="px-4 py-4 border-b border-medical-border">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {isOpen ? (
              <>
                <div className="relative">
                  <img 
                    src={settings.logoPath || '/logo.png'} 
                    alt={settings.systemName || 'MMS'} 
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBmaWxsPSIjMDI4NGM3IiBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTIwIDEwVjMwTTEwIDIwSDMwIi8+PC9zdmc+';
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-primary-600 leading-tight">{settings.systemName || 'MMS'}</h2>
                  <p className="text-xs text-medical-muted leading-tight">{settings.systemNameArabic || 'نظام الإدارة الطبية'}</p>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <img 
                  src={settings.logoPath || '/logo.png'} 
                  alt={settings.systemName || 'MMS'} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBmaWxsPSIjMDI4NGM3IiBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiLz48L3N2Zz4=';
                  }}
                />
              </div>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={`divider-${index}`} className="border-t border-medical-border my-2"></div>;
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-medical-text hover:bg-medical-light'
                } ${!isOpen ? 'justify-center' : ''}`}
                title={!isOpen ? item.label : ''}
              >
                <i className={`fas ${item.icon} text-lg`}></i>
                {isOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-medical-border">
          <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-medical-text truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-medical-muted truncate">
                  {t(`roles.${user?.role}`)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
