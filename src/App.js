import React, { useContext, useState } from "react";
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
import Login from "./components/Login";
import Register from "./components/Register";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Machines from "./components/Machines";
import EditMachine from "./components/EditMachine";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/edit-machine/:id" element={<EditMachine />} />
      </Routes>
    </Router>
  );
}

function Homepage() {
  return (
    <>
      <MainBody />
      <PartnerCompaniesComponent />
      <AboutUs />
      <ContactUs />
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="header container">
      <HeaderElements />
    </header>
  );
}

function HeaderElements() {
  const { t } = useContext(LangContext);
  const headerElement = t.headerElements.navItems;

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
  };

  return (
    <>
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

      {isLoggedIn ? (
        <div className="logout-div">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div className="login-register-buttons">
          <button
            className="login-btn"
            onClick={() => {
              setShowLoginForm((prev) => !prev);
              setShowRegisterForm(false);
            }}
          >
            Login
          </button>
          <button
            className="register-btn"
            onClick={() => {
              setShowRegisterForm((prev) => !prev);
              setShowLoginForm(false);
            }}
          >
            Register
          </button>
        </div>
      )}

      {showLoginForm && <Login onLogin={handleLoginSuccess} />}
      {showRegisterForm && <Register onRegister={handleRegisterSuccess} />}
    </>
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
      <div className="partner-companies-machines">
        <div className="partner-companies-machines">
          <Link to="/machines" className="nav-link machine-link">
            <span className="machine-component">Machines</span>
            <span className="machine-span">click to view</span>
          </Link>
        </div>
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
