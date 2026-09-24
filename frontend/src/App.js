import React, { useContext, useEffect, useLayoutEffect } from "react";
import "./styles/tokens.css";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
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
import WorkOrderForm from "./components/WorkOrderForm";
import MachinesComponent from "./components/MachinesComponent";
import MachineDetail from "./components/MachineDetail";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <LangProvider>
        <ScrollToTop />
        <PageViewTracker />
        <Nav />
        <Routes>
          {/* Georgian at the root, English under /en — see LangContext. */}
          {["", "/en"].map((prefix) => (
            <React.Fragment key={prefix || "ka"}>
              <Route path={prefix || "/"} element={<Home />} />
              <Route path={`${prefix}/machines`} element={<Machines />} />
              <Route path={`${prefix}/partners`} element={<Partners />} />
              <Route path={`${prefix}/about`} element={<About />} />
              <Route path={`${prefix}/contact`} element={<Contact />} />
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

/**
 * Starts each newly visited page at the top. Keyed on the language-free
 * path, so switching language keeps your place; back/forward (POP) is left
 * to the browser's own scroll restoration, and links that ask Home to
 * scroll to a section (state.scrollToId) are handled there instead.
 */
function ScrollToTop() {
  const { basePath } = useContext(LangContext);
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === "POP" || location.state?.scrollToId) return;
    // "instant" overrides the global `scroll-behavior: smooth` in App.css.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath]);

  return null;
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

function Contact() {
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

function About() {
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
