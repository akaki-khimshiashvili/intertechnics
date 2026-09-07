import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "../LangContext";

export default function NotFound() {
  const { t } = useContext(LangContext);
  const notFound = t.notFound;
  const navigate = useNavigate();

  return (
    <div className="container not-found">
      <span className="not-found-code">404</span>
      <h1>{notFound.title}</h1>
      <p>{notFound.body}</p>
      <button className="back-home-button" onClick={() => navigate("/")}>
        {notFound.cta}
      </button>
    </div>
  );
}
