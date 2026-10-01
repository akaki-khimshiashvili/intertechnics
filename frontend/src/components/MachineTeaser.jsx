import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { LangContext } from "LangContext";
import { assetUrl, listMachines } from "lib/api";
import Reveal from "./Reveal";

const AUTOPLAY_MS = 6000;

// The headline numbers, in order of preference; the first four a machine
// actually has are shown.
const STAT_FIELDS = [
  ["power_hp", "hp"],
  ["operating_weight_kg", "kg"],
  ["load_capacity_kg", "kg"],
  ["lift_height_m", "m"],
  ["working_hours", "h"],
];
const MAX_STATS = 4;

// Specs for the built-in Bobcat S630 shown when the API has no featured
// machines (or is down), so the fallback looks like a real listing.
const FALLBACK_SPECS = {
  condition_status: "new",
  brand: "Bobcat",
  power_hp: 74,
  operating_weight_kg: 3496,
  load_capacity_kg: 1050,
  lift_height_m: 3.1,
};

function buildStats(machine, labels) {
  return STAT_FIELDS.filter(([field]) => machine[field] != null && machine[field] !== "")
    .slice(0, MAX_STATS)
    .map(([field, unit]) => ({
      key: field,
      label: labels[field],
      // The API sends decimals as strings ("75.00"); drop the trailing zeros.
      value: Number(machine[field]).toLocaleString(undefined, { maximumFractionDigits: 1 }),
      unit,
    }));
}

export default function MachineTeaser() {
  const { t, lang, localize } = useContext(LangContext);
  const heading = t.machineTeaser.heading;
  const fallbackBody = t.machineTeaser.body;
  const cta = t.machineTeaser.cta;
  const mt = t.machines;
  const navigate = useNavigate();

  const staticMachine = t.machines.machines_description[0];
  const [featured, setFeatured] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listMachines({ featured: true, sort: "" })
      .then((res) => {
        if (cancelled) return;
        if (res.data && res.data.length > 0) setFeatured(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const slides =
    featured.length > 0
      ? featured.map((m) => ({
          key: m.id,
          name: lang === "en" && m.name_en ? m.name_en : m.name,
          body: (lang === "en" && m.description_en ? m.description_en : m.description) || fallbackBody,
          image: assetUrl(m.main_image),
          href: localize(`/machines/${m.slug}`),
          tags: [
            m.condition_status === "new" || m.condition_status === "used"
              ? mt[`condition_${m.condition_status}`]
              : null,
            m.year,
            m.brand,
          ].filter(Boolean),
          stats: buildStats(m, mt.field_labels),
        }))
      : staticMachine?.name
        ? [
            {
              key: "static",
              name: staticMachine.name,
              body: fallbackBody,
              image: staticMachine.machine_image,
              href: localize("/machines"),
              tags: [mt.condition_new, FALLBACK_SPECS.brand],
              stats: buildStats(FALLBACK_SPECS, mt.field_labels),
            },
          ]
        : [];

  const count = slides.length;
  const go = useCallback((next) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;
  const current = slides[Math.min(index, count - 1)];

  return (
    <section
      className="container machine-teaser-section"
      id="machines-id"
      aria-labelledby="machine-teaser-title"
    >
      <Reveal as="header" className="machine-teaser-header">
        <h2 id="machine-teaser-title" className="machine-teaser-title">
          {heading}
        </h2>
        <Link className="section-link" to={localize("/machines")}>
          <span>{t.machineTeaser.viewAll}</span>
          <ArrowRight width={18} height={18} strokeWidth={2.25} aria-hidden="true" />
        </Link>
      </Reveal>

      <Reveal
        as="div"
        className="machine-teaser"
        role="region"
        aria-roledescription="carousel"
        aria-label={heading}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={(e) => {
          if (count < 2) return;
          if (e.key === "ArrowLeft") go(index - 1);
          if (e.key === "ArrowRight") go(index + 1);
        }}
      >
        <div className="machine-teaser-media">
          {slides.map((s, i) => (
            <img
              key={s.key}
              className={`machine-teaser-image${i === index ? " is-active" : ""}`}
              src={s.image || undefined}
              alt={i === index ? s.name : ""}
              aria-hidden={i !== index}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
          {count > 1 && (
            <>
              <button
                type="button"
                className="machine-teaser-arrow machine-teaser-arrow--prev"
                aria-label={lang === "en" ? "Previous machine" : "წინა ტექნიკა"}
                onClick={() => go(index - 1)}
              >
                <ChevronLeft width={22} height={22} strokeWidth={2.25} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="machine-teaser-arrow machine-teaser-arrow--next"
                aria-label={lang === "en" ? "Next machine" : "შემდეგი ტექნიკა"}
                onClick={() => go(index + 1)}
              >
                <ChevronRight width={22} height={22} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        <div className="machine-teaser-copy">
          <div key={current.key} className="machine-teaser-text" aria-live={paused ? "polite" : "off"}>
            {current.tags.length > 0 && (
              <ul className="machine-teaser-tags">
                {current.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            <h3 className="machine-teaser-name">{current.name}</h3>
            {current.stats.length > 0 && (
              <dl className="machine-teaser-stats">
                {current.stats.map((s) => (
                  <div key={s.key}>
                    <dt>{s.label}</dt>
                    <dd>
                      {s.value}
                      <span>{s.unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="machine-teaser-body">{current.body}</p>
          </div>
          <button className="btn-primary" onClick={() => navigate(current.href)}>
            {cta}
          </button>
          {count > 1 && (
            <div className="machine-teaser-dots">
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`machine-teaser-dot${i === index ? " is-active" : ""}`}
                  aria-label={`${i + 1} / ${count}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
