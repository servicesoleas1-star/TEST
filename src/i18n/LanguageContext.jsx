import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'moledi_lang';

export const LANGUAGES = {
  fr: { code: 'fr', label: 'Français' },
  en: { code: 'en', label: 'English' },
};

// NOTE: the Google Translate integration (src/lib/translate.js) is
// deliberately not wired up here — the FR/EN switcher stays visible in the
// UI per spec, but the actual page-translation feature is disabled for now
// and will be reactivated in a later version.
const LanguageContext = createContext({
  lang: 'fr',
  setLang: () => {},
  translating: false,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('fr');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES[saved]) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (code) => {
    if (!LANGUAGES[code] || code === lang) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, translating: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
