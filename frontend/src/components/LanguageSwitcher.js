import { useContext } from "react";
import { LangContext } from "LangContext";

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
