import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import useDocumentMeta from "../hooks/useDocumentMeta";
import ContactUsInfo from "../components/ContactUsInfo";
import LocationMap from "../components/LocationMap";
import WorkOrderForm from "../components/WorkOrderForm";
import Footer from "../components/Footer";

export default function Contact() {
  const { t, lang } = useContext(LangContext);

  useDocumentMeta({
    title: `${t.company.title} — Intertechnics LTD`,
    description: t.contactPage.meta_description,
    lang,
  });

  return (
    <div className="page-shell">
      <div className="container contact-page page-content">
        <header className="contact-page-header">
          <h1 className="contact-page-title">{t.company.title}</h1>
          <p className="contact-page-intro">{t.contactPage.intro}</p>
        </header>
        <div className="contact-page-grid">
          <WorkOrderForm />
          <aside className="contact-page-aside">
            <ContactUsInfo
              contacts={t.company.contacts}
              address={t.company.address}
              contactUs={{ email: t.company.email }}
            />
          </aside>
        </div>
        <div className="contact-page-map">
          <LocationMap />
        </div>
      </div>
      <Footer />
    </div>
  );
}
