import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "LangContext";
import Socials from "./Socials";
import { track } from "lib/analytics";

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
          <div className="hero-proof">
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
              aria-label={t.hero.photoLabel
                .replace("{n}", i + 1)
                .replace("{total}", count)}
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
