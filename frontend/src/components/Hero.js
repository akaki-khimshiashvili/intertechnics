import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "../LangContext";
import Socials from "./Socials";

const heroImages = [
  "/images/hero-image.jpg",
  "/images/1.jpg",
  "/images/kubota-5.jpg",
  "/images/3.jpg",
];

export default function Hero({ heading, company, ctaPrimary, ctaSecondary }) {
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
        <div className="hero-copy">
          <p className="hero-title">{company}</p>
          <h1>{heading}</h1>
          <div className="hero-actions">
            <a className="cta-primary" href="tel:">
              <span>{ctaPrimary}</span>
            </a>
            <button
              className="cta-secondary"
              onClick={() => navigate(localize("/machines"))}
            >
              <span>{ctaSecondary}</span>
            </button>
          </div>
          <Socials />

          <div className="google-reviews">
            5.0
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#f2b705"
              className="size-6"
              width={16}
              height={16}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#f2b705"
              className="size-6"
              width={16}
              height={16}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#f2b705"
              className="size-6"
              width={16}
              height={16}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#f2b705"
              className="size-6"
              width={16}
              height={16}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#f2b705"
              className="size-6"
              width={16}
              height={16}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            (12)
          </div>
        </div>
      </div>
    </section>
  );
}
