import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';

const savedLanguage = typeof window !== 'undefined' 
  ? (localStorage.getItem('sahayak_language') || 'en') 
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      bn: { translation: bn },
      mr: { translation: mr },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards against XSS
    },
  });

// Broadcast language changes to window for the Chrome Extension MV3 Content Script Bridge
i18n.on('languageChanged', (newLang) => {
  if (typeof window !== 'undefined') {
    window.postMessage({ type: 'SAHAYAK_LANG_CHANGE', lang: newLang, source: 'SAHAYAK_WEB_APP' }, '*');
    window.dispatchEvent(new CustomEvent('SAHAYAK_LANG_CHANGE', { detail: { lang: newLang } }));
  }
});

export default i18n;
