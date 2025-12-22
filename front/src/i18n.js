import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "Profile": "Profile",
      "Finance": "Finance",
      "Analytics": "Analytics",
      "AI Recommendations": "AI Recommendations",
      "Logout": "Logout",
      "Language": "Language"
    }
  },
  ru: {
    translation: {
      "Profile": "Профиль",
      "Finance": "Финансы",
      "Analytics": "Аналитика",
      "AI Recommendations": "AI Рекомендации",
      "Logout": "Выйти",
      "Language": "Язык"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;