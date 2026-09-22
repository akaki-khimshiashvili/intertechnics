import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import Reveal from "./Reveal";

export default function AboutUs() {
  const { t } = useContext(LangContext);
  const aboutUs = t.aboutUs;

  return (
    <div className="container" id="about-us-id">
      <h2 className="about-us-h2">{aboutUs.title}</h2>
      <div className="about-us-text">
        {aboutUs.text.map((paragraph, i) => (
          <Reveal as="p" index={i} key={paragraph.id}>
            {paragraph.content}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
