import React, { useContext } from "react";
import { LangContext } from "LangContext";
import Reveal from "./Reveal";

/**
 * About page body. The photo unveils itself once on load (clip-path wipe +
 * settling scale, see .about-media in App.css); the heading reads as the
 * lead, the paragraphs follow as a quiet staggered list.
 */
export default function AboutUs() {
  const { t } = useContext(LangContext);
  const aboutUs = t.aboutUs;

  return (
    <div className="container about-page">
      <h2 className="about-title">{aboutUs.title}</h2>

      <div className="about-layout">
        <figure className="about-media">
          <img
            src="/images/paata.webp"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </figure>

        <div className="about-body">
          <Reveal as="h1" className="about-lead" index={2}>
            {aboutUs.heading}
          </Reveal>
          <ul className="about-list">
            {aboutUs.text.map((paragraph, i) => (
              <Reveal as="li" index={i + 3} key={paragraph.id}>
                {paragraph.content}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
