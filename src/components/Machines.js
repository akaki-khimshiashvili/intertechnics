import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddMachine from "./AddMachine";

function Machines() {
  const [machines, setMachines] = useState([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMachines();
    const role = localStorage.getItem("role");
    setIsSuperUser(role === "superuser");
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/machines");
      setMachines(res.data);
    } catch (err) {
      console.error("Failed to fetch machines:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?"))
      return;
    console.log("🗑️ Deleting machine with ID:", id);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:5000/api/machines/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Delete response:", res.data);
      fetchMachines();
    } catch (err) {
      console.error(
        "❌ Failed to delete machine:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="machine-list">
      <button onClick={() => navigate("/")} className="home-button">
        Return to Home
      </button>

      <h2 className="available-machines">Available Machines</h2>

      {isSuperUser && <AddMachine onMachineAdded={fetchMachines} />}

      <div className="machine-cards-div">
        {machines.length === 0 ? (
          <p>No machines available.</p>
        ) : (
          machines.map((machine) => (
            <div key={machine._id} className="machine-card">
              <h3>{machine.name}</h3>
              <p className="machine-description">{machine.description}</p>
              <p>💰 ${machine.price}</p>
              {isSuperUser && (
                <div className="machine-actions">
                  <button
                    onClick={() => navigate(`/edit-machine/${machine._id}`)}
                    className="edit-button"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(machine._id)}
                    className="delete-button"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
              {machine.photo && (
                <img
                  src={`http://localhost:5000/uploads/${machine.photo}`}
                  alt={machine.name}
                  width={200}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Machines;
