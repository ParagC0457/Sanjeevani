
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

const availableLanguages = [
  { value: 'English', label: 'English' },
  { value: 'Assamese', label: 'অসমীয়া (Assamese)' },
  { value: 'Bengali', label: 'বাংলা (Bengali)' },
  { value: 'Bodo', label: 'बोड़ो (Bodo)' },
  { value: 'Dogri', label: 'डोगरी (Dogri)' },
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Hindi', label: 'हिन्दी (Hindi)' },
  { value: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'Kashmiri', label: 'कॉशुर (Kashmiri)' },
  { value: 'Konkani', label: 'कोंकणी (Konkani)' },
  { value: 'Maithili', label: 'मैथिली (Maithili)' },
  { value: 'Malayalam', label: 'മലയാളം (Malayalam)' },
  { value: 'Manipuri', label: 'মৈতৈলোন্ (Manipuri)' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Nepali', label: 'नेपाली (Nepali)' },
  { value: 'Odia', label: 'ଓଡ଼ିଆ (Odia)' },
  { value: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { value: 'Sanskrit', label: 'संस्कृतम् (Sanskrit)' },
  { value: 'Santali', label: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)' },
  { value: 'Sindhi', label: 'सिन्धी (Sindhi)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)' },
];

const STORAGE_KEY = 'sanjeevani-language';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  availableLanguages: typeof availableLanguages;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('English');

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem(STORAGE_KEY);
      if (storedLanguage && availableLanguages.some(l => l.value === storedLanguage)) {
        setLanguageState(storedLanguage);
      }
    } catch (e) {
      console.error('Failed to load language from localStorage', e);
    }
  }, []);

  const setLanguage = (newLanguage: string) => {
    try {
      if (availableLanguages.some(l => l.value === newLanguage)) {
        localStorage.setItem(STORAGE_KEY, newLanguage);
        setLanguageState(newLanguage);
        // Reload the page to apply the language change throughout the app
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to save language to localStorage', e);
    }
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    availableLanguages,
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
