import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Truck, Wrench } from "lucide-react";
import { LangContext } from "LangContext";
import Reveal from "./Reveal";

// Icon, destination and panel tone per service id; the copy lives in the
// locale files.
const SERVICE_META = {
  new: { Icon: Truck, href: "/machines", tone: "dark" },
  service: { Icon: Wrench, href: "/contact", tone: "light" },
};

export default function Services() {
  const { t, localize } = useContext(LangContext);
  const copy = t.services;

  return (
    <section
      className="container services"
      id="services-id"
      aria-labelledby="services-title"
    >
      <Reveal as="h2" id="services-title" className="services-title">
        {copy.title}
      </Reveal>
      <ul className="services-grid">
        {copy.items.map((item, i) => {
          const { Icon, href, tone } = SERVICE_META[item.id];
          return (
            <Reveal
              as="li"
              key={item.id}
              index={i + 1}
              className={`service-card service-card--${tone}`}
            >
              <Link className="service-card-link" to={localize(href)}>
                {/* Oversized, faint copy of the icon bleeding off the corner. */}
                <Icon className="service-watermark" strokeWidth={1.25} aria-hidden="true" />
                <span className="service-top">
                  <span className="service-icon" aria-hidden="true">
                    <Icon width={26} height={26} strokeWidth={2} />
                  </span>
                  <span className="service-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <h3 className="service-name">{item.title}</h3>
                <p className="service-body">{item.body}</p>
                <span className="service-cta">
                  {item.cta}
                  <span className="service-arrow" aria-hidden="true">
                    <ArrowUpRight width={18} height={18} strokeWidth={2.25} />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
