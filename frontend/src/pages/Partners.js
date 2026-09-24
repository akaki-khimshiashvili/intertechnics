import React, { useContext } from "react";
import { LangContext } from "../LangContext";
import useDocumentMeta from "../hooks/useDocumentMeta";
import PartnerCard from "../components/PartnerCard";
import Footer from "../components/Footer";

export default function Partners() {
  const { t, lang } = useContext(LangContext);
  const partners = t.partnerCompanies;

  useDocumentMeta({
    title: `${partners.partnerCompaniesH1} — Intertechnics LTD`,
    description: partners.intro,
    lang,
  });

  return (
    <div className="page-shell">
      <div className="container partners-page page-content">
        <header className="partners-header">
          <h1 className="partners-title">{partners.partnerCompaniesH1}</h1>
        </header>
        <ul className="partners-grid">
          {partners.companies.map((partnerCompany, i) => (
            <li key={partnerCompany.id} style={{ "--i": i }}>
              <PartnerCard
                partnerCompany={partnerCompany}
                visitLabel={partners.visitWebsite}
              />
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  );
}
