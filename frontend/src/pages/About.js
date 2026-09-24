import React, { useContext } from "react";
import { LangContext } from "LangContext";
import useDocumentMeta from "hooks/useDocumentMeta";
import AboutUs from "components/AboutUs";
import Testimonials from "components/Testimonials";
import Footer from "components/Footer";

export default function About() {
  const { t, lang } = useContext(LangContext);

  useDocumentMeta({
    title: `${t.aboutUs.title} — Intertechnics LTD`,
    description: t.aboutUs.text[0].content,
    lang,
  });

  return (
    <div className="page-shell">
      <div className="page-content">
        <AboutUs />
        <Testimonials standalone />
      </div>
      <Footer />
    </div>
  );
}
