import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import testimonials from "../data/testimonials";

const STAR_PATH =
  "M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z";

function Stars({ label }) {
  return (
    <div className="testimonial-stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={16} height={16} aria-hidden="true">
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

export default function Testimonials() {
  const { t, lang } = useContext(LangContext);
  const copy = t.testimonials;

  if (!testimonials.length) return null;

  return (
    // No visible heading — the cards stand on their own; the title stays
    // as the section's accessible name.
    <section className="container testimonials" aria-label={copy.title}>
      <ul className="testimonials-grid">
        {testimonials.map((review) => (
          <li key={review.id} className="testimonial-card">
            <Stars label={copy.starsLabel} />
            <blockquote className="testimonial-text">
              <p>{review.text}</p>
            </blockquote>
            <footer className="testimonial-author">
              <span className="testimonial-avatar" aria-hidden="true">
                {review.name.trim().charAt(0)}
              </span>
              <span className="testimonial-meta">
                <span className="testimonial-name">{review.name}</span>
                <span className="testimonial-source">
                  {[copy.source, formatDate(review.date, lang)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}
