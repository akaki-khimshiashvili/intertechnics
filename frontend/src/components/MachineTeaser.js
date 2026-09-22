import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "../LangContext";
import { assetUrl, listMachines } from "../lib/api";
import Reveal from "./Reveal";

export default function MachineTeaser() {
  const { t } = useContext(LangContext);
  const heading = t.machineTeaser.heading;
  const body = t.machineTeaser.body;
  const cta = t.machineTeaser.cta;
  const navigate = useNavigate();

  const staticMachine = t.machines.machines_description[0];
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listMachines({ featured: true, sort: "" })
      .then((res) => {
        if (cancelled) return;
        if (res.data && res.data.length > 0) setFeatured(res.data[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const name = featured ? featured.name : staticMachine?.name;
  const image = featured ? assetUrl(featured.main_image) : staticMachine?.machine_image;
  const href = featured ? `/machines/${featured.slug}` : "/machines";

  if (!name) return null;

  return (
    <section className="container machine-teaser-section" id="machines-id">
      <Reveal as="div" className="machine-teaser">
        <div className="machine-teaser-image" style={{ backgroundImage: `url(${image})` }} />
        <div className="machine-teaser-copy">
          <span className="eyebrow">{heading}</span>
          <h2>{name}</h2>
          <p>{body}</p>
          <button className="btn-primary" onClick={() => navigate(href)}>
            {cta}
          </button>
        </div>
      </Reveal>
    </section>
  );
}
