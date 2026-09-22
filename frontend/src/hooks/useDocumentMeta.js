import { useEffect } from "react";

const SITE_URL = "https://www.intertechnics.ge";

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

function setLinkTag(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * Sets document.title, the lang attribute, meta description, canonical link,
 * and Open Graph / Twitter Card tags for the active route/language. A
 * dependency-free stand-in for react-helmet(-async), which doesn't yet
 * support React 19 as a peer dependency. Note: this app has no SSR, so none
 * of this is visible to crawlers that don't execute JavaScript — it mainly
 * benefits users' browser tabs, social share unfurls after JS runs, and
 * search engines that do render JS (Googlebot does).
 */
export default function useDocumentMeta({ title, description, lang, path, image }) {
  useEffect(() => {
    if (title) document.title = title;
    if (lang) document.documentElement.lang = lang;

    if (description) {
      setMetaTag('meta[name="description"]', { name: "description", content: description });
      setMetaTag('meta[property="og:description"]', { property: "og:description", content: description });
    }

    if (title) {
      setMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
    }

    const canonicalUrl = `${SITE_URL}${path ?? window.location.pathname}`;
    setLinkTag("canonical", canonicalUrl);
    setMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });

    if (image) {
      const absoluteImage = /^https?:\/\//.test(image) ? image : `${SITE_URL}${image}`;
      setMetaTag('meta[property="og:image"]', { property: "og:image", content: absoluteImage });
      setMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: absoluteImage });
    }

    setMetaTag('meta[property="og:locale"]', {
      property: "og:locale",
      content: lang === "en" ? "en_US" : "ka_GE",
    });
  }, [title, description, lang, path, image]);
}
