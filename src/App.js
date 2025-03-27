import PartnerCompanies from "./components/PartnerCompanies";
import "./App.css";
import ContactUsInfo from "./components/ContactUsInfo";
import "leaflet/dist/leaflet.css";
import LocationMap from "./components/LocationMap";
import logo from "./logo.png";
import SliderComponent from "./SliderComponent";
import Socials from "./components/Socials";
import getranslation from "./locales/getranslation.json";
import HeaderLi from "./components/HeaderLi";
import AboutUsText from "./components/AboutUsText";

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
  const headerElement = getranslation.headerElements.navItems;
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

function MainBody() {
  const mainBodyJS = getranslation.mainBody.bodyElements;
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
        <p>{pTag}</p>
        <button className="body-elements-button">
          <a href="#contactus-id">{button}</a>
        </button>
        <Socials />
      </section>
    </main>
  );
}

function PartnerCompaniesComponent() {
  // Json objects assignment
  const partnerCompany = getranslation.partnerCompanies.companies;
  const partnerCompanyH1 = getranslation.partnerCompanies.partnerCompaniesH1;

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
  const aboutUs = getranslation.aboutUs;
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
  const aboutUsSpan = getranslation.aboutUs.text;
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
  const contacts = getranslation.company.contacts;
  const address = getranslation.company.address;
  const contactUsEmail = getranslation.company.email;
  const contactUsH1 = getranslation.company.title;
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
