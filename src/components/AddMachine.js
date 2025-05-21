import React, { useState, useEffect } from "react";
import axios from "axios";

function AddMachine({ onMachineAdded }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [photo, setPhoto] = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsSuperUser(role === "superuser");
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    if (photo) formData.append("photo", photo);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/machines",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Machine added");
      setForm({ name: "", description: "", price: "" });
      setPhoto(null);
      onMachineAdded(res.data); // update list
    } catch (err) {
      console.error(
        "❌ Error adding machine:",
        err.response?.data || err.message
      );
      alert("Failed to add machine");
    }
  };

  if (!isSuperUser) return null;

  return (
    <form onSubmit={handleSubmit} className="add-machine-form">
      <h3>Add New Machine</h3>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Machine name"
        required
        className="machine-form-name"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        required
        className="machine-form-textarea"
      />
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        required
        className="machine-form-price"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        required
        className="machine-form-photo"
      />
      <button type="submit" className="add-machine-button">
        Add Machine
      </button>
    </form>
  );
}

export default AddMachine;
