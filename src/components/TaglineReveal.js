import React from "react";
import useReveal from "../hooks/useReveal";

/**
 * Mandatory tagline reveal section (landing-page-design B11). Text starts
 * muted; as the block crosses the trigger line each word transitions to
 * full ink individually, in reading order, staggered rather than flipping
 * as one block.
 */
export default function TaglineReveal({ text }) {
  const ref = useReveal();
  const words = text.split(" ");

  return (
    <section className="tagline-section container">
      <p ref={ref} className="tagline-text">
        {words.map((word, i) => (
          <span
            key={i}
            className="tagline-word"
            style={{ transitionDelay: `${i * 35}ms` }}
          >
            {word}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
