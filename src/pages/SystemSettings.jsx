import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../contexts/SystemSettingsContext';
import api from '../services/api';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';

function SystemSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings, updateSettings, refreshSettings } = useSystemSettings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    systemName: '',
    systemNameArabic: '',
    logoPath: '/logo.png',
    backupPath: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    // Load current settings
    setFormData({
      systemName: settings.systemName || 'MMS',
      systemNameArabic: settings.systemNameArabic || 'نظام الإدارة الطبية',
      logoPath: settings.logoPath || '/logo.png',
      backupPath: settings.backupPath || '',
    });
    setLogoPreview(settings.logoPath || '/logo.png');
  }, [user, settings]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, logo: t('admin.invalidImageType') || 'نوع الملف غير صالح. يجب أن تكون صورة' });
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setErrors({ ...errors, logo: t('admin.fileTooLarge') || 'حجم الملف كبير جداً. الحد الأقصى هو 2 ميجابايت' });
      return;
    }

    setLogoFile(file);
    setErrors({ ...errors, logo: null });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    // Validation
    const newErrors = {};
    if (!formData.systemName.trim()) {
      newErrors.systemName = t('admin.systemNameRequired') || 'اسم النظام مطلوب';
    }
    if (!formData.systemNameArabic.trim()) {
      newErrors.systemNameArabic = t('admin.systemNameArabicRequired') || 'اسم النظام بالعربية مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      let logoPath = formData.logoPath;

      // Upload logo if a new file is selected
      // Store logo as base64 data URL in JSON (no separate upload endpoint needed)
      if (logoFile) {
        if (logoPreview && logoPreview.startsWith('data:')) {
          logoPath = logoPreview; // Store base64 data URL directly in JSON
        } else {
          logoPath = '/logo.png'; // Fallback to default
        }
      }

      const updateData = {
        systemName: formData.systemName.trim(),
        systemNameArabic: formData.systemNameArabic.trim(),
        logoPath: logoPath,
        backupPath: formData.backupPath.trim() || '',
      };

      const result = await updateSettings(updateData);
      
      if (result.success) {
        setSuccess(t('admin.settingsUpdated') || 'تم تحديث الإعدادات بنجاح');
        // Refresh settings context
        await refreshSettings();
        // Clear file input
        setLogoFile(null);
        // Force page reload to update logo everywhere
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setErrors({ general: result.error || t('common.error') || 'حدث خطأ' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setErrors({ general: error.response?.data?.error || t('common.error') || 'حدث خطأ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-medical-text flex items-center gap-2">
          <i className="fas fa-cog text-primary-600"></i>
          {t('admin.systemSettings') || 'إعدادات النظام'}
        </h1>
      </div>

      <div className="crystal-card">
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* System Name (English) */}
            <Input
              label={t('admin.systemName') || 'اسم النظام (إنجليزي)'}
              value={formData.systemName}
              onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
              required
              error={errors.systemName}
              placeholder="MMS"
            />

            {/* System Name (Arabic) */}
            <Input
              label={t('admin.systemNameArabic') || 'اسم النظام (عربي)'}
              value={formData.systemNameArabic}
              onChange={(e) => setFormData({ ...formData, systemNameArabic: e.target.value })}
              required
              error={errors.systemNameArabic}
              placeholder="نظام الإدارة الطبية"
            />

            {/* Backup Path */}
            <Input
              label={t('admin.backupPath') || 'مسار النسخ الاحتياطي'}
              value={formData.backupPath}
              onChange={(e) => setFormData({ ...formData, backupPath: e.target.value })}
              error={errors.backupPath}
              placeholder="/path/to/backup"
            />

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-medical-text mb-2">
                {t('admin.systemLogo') || 'شعار النظام'}
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-32 h-32 object-contain border border-medical-border rounded-lg bg-medical-light p-2"
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-medical-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                  />
                  {errors.logo && (
                    <p className="mt-1 text-sm text-red-500">{errors.logo}</p>
                  )}
                  <p className="mt-2 text-xs text-medical-muted">
                    {t('admin.logoHint') || 'صورة PNG، JPG، أو SVG. الحد الأقصى للحجم: 2 ميجابايت'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
            <Button variant="secondary" type="button" onClick={() => navigate('/')}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} icon={loading ? 'fa-spinner fa-spin' : 'fa-save'}>
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SystemSettings;
