import { useEffect } from "react";

/**
 * Sets document.title, the lang attribute, and the meta description for the
 * active route/language. A dependency-free stand-in for react-helmet(-async),
 * which doesn't yet support React 19 as a peer dependency.
 */
export default function useDocumentMeta({ title, description, lang }) {
  useEffect(() => {
    if (title) document.title = title;
    if (lang) document.documentElement.lang = lang;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description, lang]);
}
