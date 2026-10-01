import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LangContext } from "LangContext";
import useDocumentMeta from "hooks/useDocumentMeta";
import Hero from "components/Hero";
import PartnerCompanies from "components/PartnerCompanies";
import Services from "components/Services";
import MachineTeaser from "components/MachineTeaser";
import Testimonials from "components/Testimonials";
import ContactUsInfo from "components/ContactUsInfo";
import LocationMap from "components/LocationMap";
import Footer from "components/Footer";
import Reveal from "components/Reveal";
import { ArrowRight } from "lucide-react";
import { track } from "lib/analytics";

export default function Home() {
  const { t, lang, localize } = useContext(LangContext);
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
      <Services />

      <MachineTeaser />
      <Testimonials />

      <section className="container contact-section">
        <Reveal as="header" className="section-header">
          <h2 className="section-title" id="contactus-id">
            {t.company.title}
          </h2>
          <a
            className="section-link"
            href={localize("/contact")}
            onClick={(e) => {
              e.preventDefault();
              track("contact_click", { source: "home_contact", lang });
              navigate(localize("/contact"));
            }}
          >
            <span>{t.company.cta}</span>
            <ArrowRight width={18} height={18} strokeWidth={2.25} aria-hidden="true" />
          </a>
        </Reveal>
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
