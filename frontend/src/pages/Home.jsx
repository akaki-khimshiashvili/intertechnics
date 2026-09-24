import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LangContext } from "LangContext";
import useDocumentMeta from "hooks/useDocumentMeta";
import Hero from "components/Hero";
import PartnerCompanies from "components/PartnerCompanies";
import MachineTeaser from "components/MachineTeaser";
import Testimonials from "components/Testimonials";
import ContactUsInfo from "components/ContactUsInfo";
import LocationMap from "components/LocationMap";
import Footer from "components/Footer";

export default function Home() {
  const { t, lang } = useContext(LangContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollToId = location.state?.scrollToId;
    if (scrollToId) {
      setTimeout(() => {
        document
          .getElementById(scrollToId)
          ?.scrollIntoView({ behavior: "smooth" });
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [location, navigate]);

  useDocumentMeta({
    title: `Intertechnics LTD — ${t.hero.heading}`,
    description: t.hero.subheading,
    lang,
  });

  return (
    <div>
      <Hero
        heading={t.hero.heading}
        company={t.hero.company}
        ctaPrimary={t.hero.ctaPrimary}
        ctaSecondary={t.hero.ctaSecondary}
      />

      <PartnerCompanies partnerCompanies={t.partnerCompanies.companies} />

      <MachineTeaser />
      <Testimonials />

      <section className="container contact-section">
        <h2 className="contactus-h2" id="contactus-id">
          {t.company.title}
        </h2>
        <div className="contact-layout">
          <ContactUsInfo
            contacts={t.company.contacts}
            address={t.company.address}
            contactUs={{ email: t.company.email }}
          />
          <LocationMap />
        </div>
      </section>

      <Footer />
    </div>
  );
}
