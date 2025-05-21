import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditMachine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    photo: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/machines/${id}`);
        setMachine(res.data);
        setFormData({
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          photo: null,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch machine:", err);
        setLoading(false);
      }
    };

    fetchMachine();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      await axios.put(`http://localhost:5000/api/machines/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/machines"); // or wherever you want to redirect
    } catch (err) {
      console.error("Failed to update machine:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!machine) return <p>Machine not found</p>;

  return (
    <form onSubmit={handleSubmit} className="add-machine-form">
      <h2>Edit Machine</h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        className="machine-form-name"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        className="machine-form-textarea"
      />
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        required
        className="machine-form-price"
      />
      <input
        type="file"
        name="photo"
        onChange={handleChange}
        className="machine-form-photo"
      />
      <button type="submit" className="add-machine-button">
        Save Changes
      </button>
    </form>
  );
}

export default EditMachine;
