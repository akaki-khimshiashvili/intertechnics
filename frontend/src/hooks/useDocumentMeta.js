import { useContext, useEffect } from "react";
import { LangContext, pathFor } from "../LangContext";

export const SITE_URL = "https://www.intertechnics.ge";

function setMetaTag(selector, attrs) {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== "content") tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", attrs.content);
}

function setLinkTag(selector, attrs) {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("link");
    document.head.appendChild(tag);
  }
  Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
}

function absolute(url) {
  return /^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`;
}

/**
 * Sets document.title, <html lang>, meta description, canonical, hreflang
 * alternates, robots, and Open Graph / Twitter tags for the active route.
 * The Netlify edge function (netlify/edge-functions/seo.js) writes the same
 * tags into the HTML before it's sent, so crawlers and link-preview bots see
 * them without running JavaScript; this hook keeps them in sync during
 * client-side navigation. A dependency-free stand-in for react-helmet(-async),
 * which doesn't support React 19 as a peer dependency.
 */
export default function useDocumentMeta({ title, description, image, noindex = false }) {
  const { lang, basePath } = useContext(LangContext);

  useEffect(() => {
    if (title) document.title = title;
    document.documentElement.lang = lang;

    if (description) {
      setMetaTag('meta[name="description"]', { name: "description", content: description });
      setMetaTag('meta[property="og:description"]', { property: "og:description", content: description });
      setMetaTag('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    }

    if (title) {
      setMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
      setMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    }

    setMetaTag('meta[name="robots"]', { name: "robots", content: noindex ? "noindex, follow" : "index, follow" });

    const canonicalUrl = `${SITE_URL}${pathFor(basePath, lang)}`;
    setLinkTag('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
    setMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });

    // Each page links to both language versions; x-default is Georgian.
    const alternates = { ka: pathFor(basePath, "ka"), en: pathFor(basePath, "en"), "x-default": pathFor(basePath, "ka") };
    Object.entries(alternates).forEach(([hreflang, href]) => {
      if (noindex) {
        document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`)?.remove();
      } else {
        setLinkTag(`link[rel="alternate"][hreflang="${hreflang}"]`, { rel: "alternate", hreflang, href: `${SITE_URL}${href}` });
      }
    });

    const shareImage = absolute(image || "/images/hero-image.jpg");
    setMetaTag('meta[property="og:image"]', { property: "og:image", content: shareImage });
    setMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: shareImage });

    setMetaTag('meta[property="og:locale"]', { property: "og:locale", content: lang === "en" ? "en_US" : "ka_GE" });
    setMetaTag('meta[property="og:locale:alternate"]', {
      property: "og:locale:alternate",
      content: lang === "en" ? "ka_GE" : "en_US",
    });
  }, [title, description, image, noindex, lang, basePath]);
}
