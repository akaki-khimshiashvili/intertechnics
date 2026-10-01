import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "LangContext";
import Socials from "./Socials";
import { track } from "lib/analytics";
import { GOOGLE_REVIEWS_URL, GOOGLE_REVIEW_COUNT } from "data/testimonials";

const STAR_PATH =
  "M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z";

const heroImages = [
  "/images/hero-image.webp",
  "/images/1.webp",
  "/images/kubota-5.webp",
  "/images/3.webp",
];

// How long each photo stays up. The progress bar's fill animation runs for
// exactly this long, and its `animationend` is what advances the slide — so
// pausing the animation (hover, off-screen) pauses the slideshow too.
const SLIDE_MS = 6000;

export default function Hero({ heading, company, ctaPrimary, ctaSecondary }) {
  const navigate = useNavigate();
  const { t, localize, lang } = useContext(LangContext);
  const heroRef = useRef(null);
  const [offscreen, setOffscreen] = useState(false);
  const [hovered, setHovered] = useState(false);
  // `prev` stays visible underneath while the new slide wipes in over it;
  // null on first load so the opening photo just appears.
  const [{ index, prev }, setSlide] = useState({ index: 0, prev: null });

  const goTo = (next) =>
    setSlide((s) => (next === s.index ? s : { index: next, prev: s.index }));

  // Pause the slideshow while the hero is scrolled out of view — no point
  // compositing full-screen layers nobody can see.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOffscreen(!entry.isIntersecting),
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const count = heroImages.length;
  const paused = offscreen || hovered;

  return (
    <section
      ref={heroRef}
      className={`hero ${paused ? "is-paused" : ""}`}
      style={{ "--slide-ms": `${SLIDE_MS}ms` }}
    >
      {/* Marks the top of the page so Nav can tell, via IntersectionObserver,
          when the hero has scrolled out from under the header. */}
      <div id="hero-sentinel" aria-hidden="true" />
      <div className="hero-slides" aria-hidden="true">
        {heroImages.map((src, i) => (
          <picture
            key={src}
            className={`hero-slide${i === index ? " is-active" : ""}${
              i === index && prev !== null ? " is-wiping" : ""
            }${i === prev ? " is-prev" : ""}`}
          >
            {/* The main photo is a 3:1 panorama — on portrait phones it'd be
                blown up ~3x, so they get the dedicated portrait crop. */}
            {i === 0 && (
              <source
                media="(max-width: 600px) and (orientation: portrait)"
                srcSet="/images/hero-image-sm.webp"
              />
            )}
            <img
              src={src}
              alt=""
              decoding="async"
              // Only the first slide is on screen at load; the rest shouldn't
              // compete with it for bandwidth.
              fetchPriority={i === 0 ? "high" : "low"}
            />
          </picture>
        ))}
      </div>
      <div className="hero-scrim" />

      <div className="hero-content container">
        <div className="hero-copy">
          <p className="hero-title">{company}</p>
          <h1>{heading}</h1>
          <div className="hero-actions">
            <a
              className="cta-primary"
              href="tel:+995597787815"
              onClick={() => track("phone_click", { source: "hero", lang })}
            >
              <span>{ctaPrimary}</span>
            </a>
            <button
              className="cta-secondary"
              onClick={() => navigate(localize("/machines"))}
            >
              <span>{ctaSecondary}</span>
            </button>
          </div>
          {/* Proof row: Google rating chip, a hairline, then the socials. */}
          <div className="hero-proof">
            <a
              className="hero-rating"
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hero-rating-stars" role="img" aria-label="5 / 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d={STAR_PATH} />
                  </svg>
                ))}
              </span>
              <strong>5.0</strong>
              <span className="hero-rating-sep" aria-hidden="true" />
              <span>{t.hero.reviews.replace("{count}", GOOGLE_REVIEW_COUNT)}</span>
            </a>
            <span className="hero-proof-divider" aria-hidden="true" />
            <Socials className="socials--hero" />
          </div>
        </div>
      </div>

      {/* Story-style progress: one bar per photo, the current one filling
          over SLIDE_MS. Click a bar to jump to that photo. Hovering the
          bars (not the whole hero — it fills the screen) holds the photo. */}
      <div
        className="hero-progress container"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="hero-counter" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
          <span> / {String(count).padStart(2, "0")}</span>
        </span>
        <div className="hero-bars">
          {heroImages.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`hero-bar${i === index ? " is-active" : ""}${i < index ? " is-done" : ""}`}
              aria-label={
                lang === "en" ? `Photo ${i + 1} of ${count}` : `ფოტო ${i + 1} / ${count}`
              }
              aria-current={i === index}
              onClick={() => goTo(i)}
            >
              <span
                className="hero-bar-fill"
                onAnimationEnd={i === index ? () => goTo((index + 1) % count) : undefined}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
