import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref and marks the element
 * `data-revealed="true"` once it crosses the trigger line. Fires once.
 * CSS (see .reveal in App.css) drives the actual transition — this hook only
 * flips the attribute, never runs the animation itself.
 */
export default function useReveal(options) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-revealed", "true");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-revealed", "true");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "-10% 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
