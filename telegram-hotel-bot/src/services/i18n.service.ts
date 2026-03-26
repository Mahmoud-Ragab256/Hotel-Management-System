import i18next from 'i18next';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

i18next.init({
  lng: 'ar',
  fallbackLng: 'ar',
  resources: {
    ar: { translation: ar },
    en: { translation: en }
  },
  interpolation: {
    escapeValue: false
  }
});

export const t = (key: string, options?: any) => {
  return i18next.t(key, options);
};

export const changeLanguage = (lng: string) => {
  return i18next.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18next.language;
};

export default i18next;
