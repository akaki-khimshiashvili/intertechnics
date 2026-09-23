import React, { createContext, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import en from "./locales/entranslation.json";
import ka from "./locales/getranslation.json";

const translations = { ka, en };
const STORAGE_KEY = "language";

/**
 * The language lives in the URL — Georgian at the root (/, /machines/...),
 * English under /en (/en, /en/machines/...) — so each language version is
 * its own indexable page with its own canonical/hreflang, instead of one URL
 * whose text depends on localStorage (which crawlers never have).
 */
export function langFromPath(pathname) {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ka";
}

/** "/en/machines/x" -> "/machines/x"; "/en" -> "/". */
export function stripLang(pathname) {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** Language-neutral path -> that path in `lang`. */
export function pathFor(path, lang) {
  if (lang !== "en") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

export const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = langFromPath(location.pathname);
  const basePath = stripLang(location.pathname);

  // Remember the visitor's choice; a returning English visitor who lands on
  // a Georgian URL (e.g. the bare domain) is moved to the English version.
  // Crawlers have no stored choice, so they always get the URL they asked for.
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (stored === "en" && lang === "ka") {
      navigate(pathFor(basePath, "en") + location.search + location.hash, { replace: true });
    }
    // Only on first load — afterwards the URL is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localize = useCallback((path) => pathFor(path, lang), [lang]);

  const switchLanguage = useCallback(() => {
    const next = lang === "ka" ? "en" : "ka";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    navigate(pathFor(basePath, next) + location.search + location.hash);
  }, [lang, basePath, location.search, location.hash, navigate]);

  const value = useMemo(
    () => ({ lang, basePath, localize, switchLanguage, t: translations[lang] }),
    [lang, basePath, localize, switchLanguage]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};
