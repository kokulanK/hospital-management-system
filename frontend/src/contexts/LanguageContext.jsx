// frontend/src/contexts/LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('app-language');
    if (saved && translations[saved]) setLanguage(saved);
  }, []);

  const changeLanguage = (lng) => {
    if (translations[lng]) {
      setLanguage(lng);
      localStorage.setItem('app-language', lng);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);