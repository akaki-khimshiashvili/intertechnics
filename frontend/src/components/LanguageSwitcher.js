import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import geflag from "../ge1.svg";
import enflag from "../gb.svg";

export default function LanguageSwitcher() {
  const { switchLanguage, lang } = useContext(LangContext);

  return (
    <div className="lang-switcher">
      <button
        onClick={switchLanguage}
        aria-label={
          lang === "ka" ? "Switch to English" : "ქართულ ენაზე გადართვა"
        }
      >
        {lang === "ka" ? "Eng" : "ქართ"}
      </button>
    </div>
  );
}
