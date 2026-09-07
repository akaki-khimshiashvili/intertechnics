import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "../LangContext";
import Reveal from "./Reveal";

export default function MachineTeaser() {
  const { t } = useContext(LangContext);
  const machine = t.machines.machines_description[0];
  const heading = t.machineTeaser.heading;
  const body = t.machineTeaser.body;
  const cta = t.machineTeaser.cta;
  const navigate = useNavigate();

  if (!machine) return null;

  return (
    <section className="container machine-teaser-section" id="machines-id">
      <Reveal as="div" className="machine-teaser">
        <div
          className="machine-teaser-image"
          style={{ backgroundImage: `url(${machine.machine_image})` }}
        />
        <div className="machine-teaser-copy">
          <span className="eyebrow">{heading}</span>
          <h2>{machine.name}</h2>
          <p>{body}</p>
          <button className="btn-primary" onClick={() => navigate("/machines")}>
            {cta}
          </button>
        </div>
      </Reveal>
    </section>
  );
}
