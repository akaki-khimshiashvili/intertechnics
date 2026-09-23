import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "../LangContext";
import logo from "../logo.png";
import Socials from "./Socials";

const heroImages = [
  "/images/hero-image.jpg",
  "/images/1.jpg",
  "/images/kubota-5.jpg",
  "/images/3.jpg",
];

export default function Hero({ heading, subheading, ctaLabel }) {
  const navigate = useNavigate();
  const { localize } = useContext(LangContext);

  return (
    <section className="hero">
      {/* Marks the top of the page so Nav can tell, via IntersectionObserver,
          when the hero has scrolled out from under the header. */}
      <div id="hero-sentinel" aria-hidden="true" />
      <div className="hero-slides" aria-hidden="true">
        {heroImages.map((src, i) => (
          <div
            key={src}
            className="hero-slide"
            style={{
              backgroundImage: `url(${src})`,
              animationDelay: `${i * 6}s`,
            }}
          />
        ))}
      </div>
      <div className="hero-scrim" />

      <div className="hero-content container">
        <a
          className="hero-logo-link"
          href={localize("/")}
          onClick={(e) => {
            e.preventDefault();
            navigate(localize("/"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src={logo} className="logo" alt="Intertechnics" />
        </a>
        <div className="hero-copy">
          <h1>{heading}</h1>
          <p>{subheading}</p>
          <div className="hero-actions">
            <button
              className="body-elements-machines-button"
              onClick={() => navigate(localize("/machines"))}
            >
              <span>{ctaLabel}</span>
            </button>
          </div>
          <Socials />
        </div>
      </div>
    </section>
  );
}
