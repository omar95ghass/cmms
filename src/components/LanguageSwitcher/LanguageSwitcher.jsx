import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="crystal-button-secondary text-sm"
      aria-label="Toggle language"
    >
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}

export default LanguageSwitcher;
