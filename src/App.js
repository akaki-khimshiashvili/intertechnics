import React, { useContext } from "react";
import PartnerCompanies from "./components/PartnerCompanies";
import "./App.css";
import ContactUsInfo from "./components/ContactUsInfo";
import "leaflet/dist/leaflet.css";
import LocationMap from "./components/LocationMap";
import logo from "./logo.png";
import SliderComponent from "./SliderComponent";
import Socials from "./components/Socials";
import HeaderLi from "./components/HeaderLi";
import AboutUsText from "./components/AboutUsText";
import { LangContext } from "./LangContext";
import geflag from "./ge1.svg";
import enflag from "./gb.svg";

function App() {
  return (
    <div>
      <Header />
      <MainBody />
      <PartnerCompaniesComponent />
      <AboutUs />
      <ContactUs />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <div>
      <HeaderElements />
    </div>
  );
}

function HeaderElements() {
  const { t } = useContext(LangContext);
  const headerElement = t.headerElements.navItems;
  return (
    <header className="header container">
      <nav>
        <ul className="nav-ul">
          {headerElement.map((element) => (
            <HeaderLi
              key={element.id}
              link={element.link}
              content={element.name}
            />
          ))}
        </ul>
      </nav>
    </header>
  );
}

function LanguageSwitcher() {
  const { switchLanguage, lang } = useContext(LangContext);

  return (
    <div className="lang-switcher">
      <button onClick={switchLanguage}>
        <p>
          {lang === "ka" ? (
            <img src={enflag} alt="English" width="40" />
          ) : (
            <img src={geflag} alt="ქართული" width="40" />
          )}
        </p>
      </button>
    </div>
  );
}

function MainBody() {
  const { t } = useContext(LangContext);
  const mainBodyJS = t.mainBody.bodyElements;
  return (
    <div className="container main-body">
      <SliderComponent />
      <div className="inner">
        <BodyElements pTag={mainBodyJS.pTag} button={mainBodyJS.button} />
      </div>
    </div>
  );
}

function BodyElements({ pTag, button }) {
  return (
    <main>
      <section className="main-body-elements">
        <img src={logo} className="logo" alt="" />
        <div className="after-logo">
          <p>{pTag}</p>
          <button className="body-elements-button">
            <a href="#contactus-id">{button}</a>
          </button>
          <Socials />
          <LanguageSwitcher />
        </div>
      </section>
    </main>
  );
}

function PartnerCompaniesComponent() {
  const { t } = useContext(LangContext);
  const partnerCompany = t.partnerCompanies.companies;
  const partnerCompanyH1 = t.partnerCompanies.partnerCompaniesH1;
  return (
    <div className="partner-companies container">
      <h1 className="partner-company-h1" id="partner-company-id">
        {partnerCompanyH1}
      </h1>
      <div className="company-components">
        <PartnerCompanies partnerCompanies={partnerCompany} />
      </div>
    </div>
  );
}

function AboutUs() {
  const { t } = useContext(LangContext);
  const aboutUs = t.aboutUs;
  return (
    <div className="container">
      <h2 className="about-us-h2" id="about-us-id">
        {aboutUs.title}
      </h2>
      <AboutUsElements />
    </div>
  );
}

function AboutUsElements() {
  const { t } = useContext(LangContext);
  const aboutUsSpan = t.aboutUs.text;
  return (
    <div>
      <p className="about-us-text">
        {aboutUsSpan.map((element) => (
          <AboutUsText key={element.id} text={element.content} />
        ))}
      </p>
    </div>
  );
}

function ContactUs() {
  const { t } = useContext(LangContext);
  const contacts = t.company.contacts;
  const address = t.company.address;
  const contactUsEmail = t.company.email;
  const contactUsH1 = t.company.title;
  return (
    <div className="container">
      <h1 className="contactus-h2" id="contactus-id">
        {contactUsH1}
      </h1>
      <ContactUsInfo
        contacts={contacts}
        address={address}
        contactUs={contactUsEmail}
      />

      <LocationMap />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer container">
      <span className="copyright">&copy;</span> 2005 –{" "}
      {new Date().getFullYear()} — Intertechnics LTD
    </footer>
  );
}

export default App;
