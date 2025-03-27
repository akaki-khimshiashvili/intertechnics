import React, { createContext, useState, useEffect } from "react";
import en from "./locales/entranslation.json";
import ka from "./locales/getranslation.json";

const translations = { ka, en };

export const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const storedLang = localStorage.getItem("language") || "ka"; // Persist language
  const [lang, setLang] = useState(storedLang);

  useEffect(() => {
    localStorage.setItem("language", lang);
  }, [lang]);

  const switchLanguage = () => {
    setLang(lang === "ka" ? "en" : "ka");
  };

  return (
    <LangContext.Provider
      value={{ lang, switchLanguage, t: translations[lang] }}
    >
      {children}
    </LangContext.Provider>
  );
};
