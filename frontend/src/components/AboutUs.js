import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import Reveal from "./Reveal";

/**
 * About page body. The photo unveils itself once on load (clip-path wipe +
 * settling scale, see .about-media in App.css); the first paragraph reads as
 * the lead, the rest follow as a quiet staggered list.
 */
export default function AboutUs() {
  const { t } = useContext(LangContext);
  const aboutUs = t.aboutUs;
  const [lead, ...rest] = aboutUs.text;

  return (
    <div className="container about-page">
      <h1 className="about-title">{aboutUs.title}</h1>

      <div className="about-layout">
        <figure className="about-media">
          <img
            src="/images/aboutusimage.webp"
            alt=""
            width={1020}
            height={1020}
            decoding="async"
            fetchPriority="high"
          />
        </figure>

        <div className="about-body">
          <Reveal as="p" className="about-lead" index={2}>
            {lead.content}
          </Reveal>
          <ul className="about-list">
            {rest.map((paragraph, i) => (
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
