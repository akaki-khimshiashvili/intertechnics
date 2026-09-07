import React from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "./Reveal";

function MachinesComponent({ machines, machinesButton }) {
  const navigate = useNavigate();
  return (
    <>
      <button
        className="back-home-button"
        onClick={() => navigate("/")}
        style={{ marginBottom: "20px" }}
      >
        {machinesButton}
      </button>
      <div className="machines-container">
        {machines.map((machine, i) => (
          <Reveal as="div" index={i} key={i} className="machines-card">
            <div
              className="machines-card-image"
              style={{ backgroundImage: `url(${machine.machine_image})` }}
            />
            <div className="machines-card-body">
              <h2>{machine.name}</h2>
              <ul className="machines-specs">
                {machine.description.map((line, index) => {
                  const [label, value] = line.split(":");
                  return (
                    <li key={index}>
                      <span className="spec-label">{label}</span>
                      <span className="spec-value">{value ?? ""}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

export default MachinesComponent;
