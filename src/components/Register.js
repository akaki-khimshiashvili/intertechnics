import React, { useState } from "react";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: "user", // or "superuser" (for testing only)
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess("Registration successful! You can now log in.");
      onRegister();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-form">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="register-input-field"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="register-input-field"
      />
      <button type="submit" className="register-input-button">
        Register
      </button>
      {error && <p className="register-error">{error}</p>}
      {success && <p className="register-success">{success}</p>}
    </form>
  );
}

export default Register;
