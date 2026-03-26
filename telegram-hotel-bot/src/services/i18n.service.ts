import i18next from 'i18next';
import ar from '../locales/ar.json';
import en from '../locales/en.json';
import { BotContext } from '../middlewares/auth.middleware';

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

export const t = (key: string, options?: any): string => {
  return i18next.t(key, options) as string;
};

export const changeLanguage = (lng: string) => {
  return i18next.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18next.language;
};

// Middleware: attaches ctx.t() based on user's language preference
export const i18nMiddleware = async (ctx: BotContext, next: () => Promise<void>) => {
  const lang = (ctx.user?.language) || (ctx.from?.language_code === 'en' ? 'en' : 'ar');

  ctx.t = (key: string, options?: any): string => {
    return i18next.t(key, { lng: lang, ...options }) as string;
  };

  return next();
};

export default i18next;
