import React, { useContext } from "react";
import { Quote } from "lucide-react";
import { LangContext } from "LangContext";
import testimonials, { GOOGLE_REVIEWS_URL } from "data/testimonials";
import Reveal from "./Reveal";

const STAR_PATH =
  "M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z";

// Every review in data/testimonials is a 5-star Google review.
const RATING = 5;

function Stars({ label, size = 16 }) {
  return (
    <div className="testimonial-stars" role="img" aria-label={label}>
      {Array.from({ length: RATING }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

// "YYYY" shows just the year; "YYYY-MM" adds the month.
function formatDate(date, lang) {
  if (!date) return null;
  const [year, month] = date.split("-").map(Number);
  if (!month) return String(year);
  return new Date(year, month - 1).toLocaleDateString(
    lang === "en" ? "en-US" : "ka-GE",
    { year: "numeric", month: "long" },
  );
}

// `standalone` (the About page) only changes the section's spacing.
export default function Testimonials({ standalone = false }) {
  const { t, lang } = useContext(LangContext);
  const copy = t.testimonials;

  if (!testimonials.length) return null;

  return (
    <section
      className={`container testimonials ${standalone ? "is-standalone" : ""}`}
      aria-labelledby="testimonials-title"
    >
      <Reveal as="header" className="testimonials-header">
        <div className="testimonials-heading">
          <h2 id="testimonials-title" className="section-title">
            {copy.title}
          </h2>
          <p className="testimonials-google">
            <Stars label={copy.starsLabel} size={15} />
            <span>
              <strong>{RATING.toFixed(1)}</strong> {copy.ratingLabel}
            </span>
            <span aria-hidden="true">·</span>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
              {copy.seeAll}
            </a>
          </p>
        </div>
      </Reveal>

      <ul className="testimonials-stack">
        {testimonials.map((review, i) => (
          <Reveal
            as="li"
            key={review.id}
            index={Math.min(i + 1, 4)}
            className="testimonial-item"
          >
            {/* The card lives inside the <li> so its hover transform doesn't
                fight the reveal animation (and its stagger delay) on the li. */}
            <div className={`testimonial-card${i === 0 ? " is-featured" : ""}`}>
              <div className="testimonial-inner">
                <span className="testimonial-avatar" data-tone={i % 4} aria-hidden="true">
                  {review.name.trim().charAt(0)}
                </span>
                <header className="testimonial-head">
                  <span className="testimonial-name">{review.name}</span>
                  <span className="testimonial-meta">
                    <Stars label={copy.starsLabel} size={12} />
                    <span className="testimonial-source">
                      {[copy.source, formatDate(review.date, lang)]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </header>
                <Quote className="testimonial-quote" width={26} height={26} aria-hidden="true" />
                <blockquote className="testimonial-text">
                  <p>{review.text}</p>
                </blockquote>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
