import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

function Login() {
  const { t } = useTranslation();
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      // Check if system is locked
      if (result.locked) {
        setError(result.message || 'System is locked. Trial period has expired.');
      } else {
        setError(result.message || t('auth.invalidCredentials'));
      }
    }
    
    setLoading(false);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-light">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  // Don't show login form if already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-medical-light px-4">
      <div className="crystal-card max-w-md w-full shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="MMS Logo" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBmaWxsPSIjMDI4NGM3IiBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTQwIDIwVjYwTTIwIDQwSDYwIi8+PC9zdmc+';
              }}
            />
            <h1 className="text-2xl font-bold text-primary-600">MMS</h1>
            <p className="text-sm text-medical-muted">نظام الإدارة الطبية المركزي</p>
          </Link>
        </div>
        
        <h2 className="text-xl font-semibold text-center mb-6 text-medical-text">
          {t('auth.loginTitle')}
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            label={t('auth.username')}
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            autoFocus
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading} icon={loading ? 'fa-spinner fa-spin' : 'fa-sign-in-alt'}>
            {loading ? t('common.loading') : t('common.login')}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
