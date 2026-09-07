import React, { useContext, useEffect } from "react";
import "./styles/tokens.css";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { LangContext } from "./LangContext";
import useDocumentMeta from "./hooks/useDocumentMeta";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TrustStrip from "./components/TrustStrip";
import TaglineReveal from "./components/TaglineReveal";
import PartnerCompanies from "./components/PartnerCompanies";
import AboutUs from "./components/AboutUs";
import MachineTeaser from "./components/MachineTeaser";
import ContactUsInfo from "./components/ContactUsInfo";
import LocationMap from "./components/LocationMap";
import MachinesComponent from "./components/MachinesComponent";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import Reveal from "./components/Reveal";

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

function Home() {
  const { t, lang } = useContext(LangContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollToId = location.state?.scrollToId;
    if (scrollToId) {
      setTimeout(() => {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: "smooth" });
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [location, navigate]);

  useDocumentMeta({
    title: "Intertechnics LTD — Construction Equipment, Georgia",
    description: t.hero.subheading,
    lang,
  });

  return (
    <div>
      <Hero
        heading={t.hero.heading}
        subheading={t.hero.subheading}
        ctaLabel={t.hero.cta}
      />
      <TrustStrip />
      <TaglineReveal text={t.tagline} />

      <div className="container">
        <h1 className="partner-company-h1" id="partner-company-id">
          {t.partnerCompanies.partnerCompaniesH1}
        </h1>
        <PartnerCompanies partnerCompanies={t.partnerCompanies.companies} />
      </div>

      <AboutUs />
      <MachineTeaser />

      <div className="container">
        <h1 className="contactus-h2" id="contactus-id">
          {t.company.title}
        </h1>
        <ContactUsInfo
          contacts={t.company.contacts}
          address={t.company.address}
          contactUs={{ email: t.company.email }}
        />
        <LocationMap />
      </div>

      <Footer />
    </div>
  );
}

function Machines() {
  const { t, lang } = useContext(LangContext);

  useDocumentMeta({
    title: `${t.machines.machines_title} — Intertechnics LTD`,
    description: t.machineTeaser.body,
    lang,
  });

  return (
    <div>
      <div className="container machines-page">
        <h2 className="machines-title">{t.machines.machines_title}</h2>
        <MachinesComponent
          machines={t.machines.machines_description}
          machinesButton={t.machines.machines_button}
        />
      </div>
      <Footer />
    </div>
  );
}

function NotFoundPage() {
  const { t, lang } = useContext(LangContext);

  useDocumentMeta({
    title: `${t.notFound.title} — Intertechnics LTD`,
    lang,
  });

  return (
    <div>
      <Reveal as="div">
        <NotFound />
      </Reveal>
      <Footer />
    </div>
  );
}

export default App;
