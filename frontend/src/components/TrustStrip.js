import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import Reveal from "./Reveal";

export default function TrustStrip() {
  const { t } = useContext(LangContext);
  const stats = t.trustStrip.stats;

  return (
    <div className="trust-strip container">
      {stats.map((stat, i) => (
        <Reveal as="div" index={i} className="trust-stat" key={stat.id}>
          <span className="trust-stat-value">{stat.value}</span>
          <span className="trust-stat-label">{stat.label}</span>
        </Reveal>
      ))}
    </div>
  );
}
