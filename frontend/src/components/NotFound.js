import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { LangContext } from "LangContext";
import { track } from "lib/analytics";

export default function NotFound() {
  const { t, lang, localize } = useContext(LangContext);
  const notFound = t.notFound;
  const navigate = useNavigate();

  const go = (path) => (e) => {
    e.preventDefault();
    navigate(localize(path));
  };

  return (
    <section className="container not-found" aria-labelledby="not-found-title">
      <p className="not-found-code" aria-hidden="true">
        4<span>0</span>4
      </p>
      <h1 id="not-found-title">{notFound.title}</h1>
      <p className="not-found-body">{notFound.body}</p>

      <div className="not-found-actions">
        <a className="btn-primary" href={localize("/machines")} onClick={go("/machines")}>
          {notFound.cta_machines}
        </a>
        <a className="not-found-secondary" href={localize("/")} onClick={go("/")}>
          <ArrowLeft width={18} height={18} aria-hidden="true" />
          <span>{notFound.cta}</span>
        </a>
      </div>

      <p className="not-found-help">
        {notFound.help}{" "}
        <a href="tel:+995599502517" onClick={() => track("phone_click", { source: "not_found", lang })}>
          <Phone width={14} height={14} aria-hidden="true" />
          599 50 25 17
        </a>
      </p>
    </section>
  );
}
