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
        aria-label={lang === "ka" ? "Switch to English" : "ქართულ ენაზე გადართვა"}
      >
        <img
          src={lang === "ka" ? enflag : geflag}
          alt={lang === "ka" ? "English" : "ქართული"}
          width="28"
        />
      </button>
    </div>
  );
}
