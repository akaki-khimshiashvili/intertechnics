import React from "react";
import { useNavigate } from "react-router-dom";

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
        {machines.map((machine, id) => (
          <div key={id} className="machines-card">
            <h2>{machine.name}</h2>
            <img src={machine.machine_image} alt={machine.machine_title} />
            <p className="machines-p">
              {machine.description.map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default MachinesComponent;
