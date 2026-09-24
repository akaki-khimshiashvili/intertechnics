import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import useDocumentMeta from "../hooks/useDocumentMeta";
import MachinesComponent from "../components/MachinesComponent";
import Footer from "../components/Footer";

export default function Machines() {
  const { t, lang } = useContext(LangContext);

  useDocumentMeta({
    title: `${t.machines.machines_title} — Intertechnics LTD`,
    description: t.machines.meta_description,
    lang,
  });

  return (
    <div className="page-shell">
      <div className="container machines-page page-content">
        <h1 className="machines-title">{t.machines.machines_title}</h1>
        <MachinesComponent machines={t.machines.machines_description} />
      </div>
      <Footer />
    </div>
  );
}
