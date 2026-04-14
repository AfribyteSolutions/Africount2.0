import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import esTranslations from '../locales/es.json';
import swTranslations from '../locales/sw.json';
import arTranslations from '../locales/ar.json';

const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
  sw: { translation: swTranslations },
  ar: { translation: arTranslations },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18next;
