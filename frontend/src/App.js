import React, { useContext, useEffect } from "react";
import "./styles/tokens.css";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { LangContext, LangProvider } from "./LangContext";
import useDocumentMeta from "./hooks/useDocumentMeta";
import { track } from "./lib/analytics";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import PartnerCompanies from "./components/PartnerCompanies";
import PartnerCard from "./components/PartnerCard";
import AboutUs from "./components/AboutUs";
import Testimonials from "./components/Testimonials";
import MachineTeaser from "./components/MachineTeaser";
import ContactUsInfo from "./components/ContactUsInfo";
import LocationMap from "./components/LocationMap";
import MachinesComponent from "./components/MachinesComponent";
import MachineDetail from "./components/MachineDetail";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <LangProvider>
        <PageViewTracker />
        <Nav />
        <Routes>
          {/* Georgian at the root, English under /en — see LangContext. */}
          {["", "/en"].map((prefix) => (
            <React.Fragment key={prefix || "ka"}>
              <Route path={prefix || "/"} element={<Home />} />
              <Route path={`${prefix}/machines`} element={<Machines />} />
              <Route path={`${prefix}/partners`} element={<Partners />} />
              <Route
                path={`${prefix}/machines/:slug`}
                element={<MachineDetail />}
              />
            </React.Fragment>
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </LangProvider>
    </Router>
  );
}

/** Counts a page view per route; see lib/analytics.js. */
function PageViewTracker() {
  const { lang, basePath } = useContext(LangContext);

  useEffect(() => {
    // Short settle so an immediate redirect (e.g. a returning English
    // visitor sent from / to /en) is counted once, not twice.
    const handle = setTimeout(
      () => track("page_view", { path: basePath, lang }),
      400,
    );
    return () => clearTimeout(handle);
  }, [basePath, lang]);

  return null;
}

function Home() {
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
      <AboutUs />
      <Testimonials />

      <div className="container">
        <h2 className="contactus-h2" id="contactus-id">
          {t.company.title}
        </h2>
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

function Partners() {
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

function NotFoundPage() {
  const { t, lang } = useContext(LangContext);

  useDocumentMeta({
    title: `${t.notFound.title} — Intertechnics LTD`,
    description: t.notFound.body,
    lang,
    noindex: true,
  });

  return (
    <div className="page-shell">
      <div className="page-content">
        <NotFound />
      </div>
      <Footer />
    </div>
  );
}

export default App;
