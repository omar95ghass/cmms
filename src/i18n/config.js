import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations - Vite handles JSON imports automatically
import arJSON from './locales/ar.json';
import enJSON from './locales/en.json';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { 
        translation: arJSON 
      },
      en: { 
        translation: enJSON 
      },
    },
    fallbackLng: 'ar',
    defaultNS: 'translation',
    lng: 'ar',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
