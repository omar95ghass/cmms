import React from 'react';
import { useTranslation } from 'react-i18next';

function TrialLock() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="crystal-card max-w-md w-full shadow-xl text-center">
        <div className="mb-6">
          <i className="fas fa-lock text-6xl text-red-600 mb-4"></i>
        </div>
        
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          {t('trial.locked')}
        </h1>
        
        <p className="text-lg text-medical-text mb-6">
          {t('trial.expired')}
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            {t('trial.contactAdmin')}
          </p>
        </div>
        
        <div className="text-sm text-medical-muted">
          <p>{t('trial.trialPeriod')}: 3 {t('common.days')}</p>
        </div>
      </div>
    </div>
  );
}

export default TrialLock;
