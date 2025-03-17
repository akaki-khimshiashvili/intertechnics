import PartnerCompanies from "./PartnerCompanies";
import partnerCompanies from "./partnerCompanies.json";
import "./App.css";
// import kubota from "./Kubota-Logo.png";
import contactUs from "./contactUs.json";
import ContactUsInfo from "./ContactUsInfo";

import logo from "./logo.png";

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
  return (
    <header className="header container">
      <nav>
        <ul className="nav-ul">
          <li>
            <a href="#" className="nav-button">
              პარტნიორი კომპანიები
            </a>
          </li>
          <li>
            <a href="#" className="nav-button">
              ჩვენ შესახებ
            </a>
          </li>
          <li>
            <a href="#" className="nav-button">
              კონტაქტი
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function MainBody() {
  return (
    <div className="container main-body">
      <BodyElements
        pTag={"უმაღლესი ხარისხის სამშენებლო ტექნიკა"}
        button={"დაგვიკავშირდით"}
      />
    </div>
  );
}

function BodyElements({ pTag, button }) {
  return (
    <main>
      <section className="main-body-elements">
        <img src={logo} className="logo" alt="" />
        <p>{pTag}</p>
        <button className="body-elements-button">{button}</button>
      </section>
    </main>
  );
}

function PartnerCompaniesComponent() {
  // Json objects assignment
  const partnerCompany = partnerCompanies.companies;

  return (
    <div className="partner-companies container">
      <h1 className="partner-company-h1">პარტნიორი კომპანიები</h1>
      <div className="company-components">
        <PartnerCompanies partnerCompanies={partnerCompany} />
      </div>
    </div>
  );
}

function AboutUs() {
  return (
    <div className="container">
      <h1 className="about-us-h1">ჩვენ შესახებ</h1>
      <AboutUsElements />
    </div>
  );
}

function AboutUsElements() {
  return (
    <div>
      <p className="about-us-text">
        <span>
          Intertechnics LTD-ის მთავარი მიზანია საბაზრო წილისა და
          კომპეტენტუნარიანობის შენარჩუნება ცვალებად ქართულ ბაზარზე.
        </span>
        <span>
          კომპანია პარტნიორობს მოწინავე საგზაო-სამშენებლო ტექნიკის მწარმოებელ
          ბრენდებთან 2005 წლიდან. ეს ურთიერთობები უზრუნველყოფს ინოვაციებისა და
          უმაღლესი ხარისხის ტექნიკის შემოდინებას ქართულ სამშენებლო სივრცეში.
        </span>
        <span>
          პარტნიორობის პირველ ეტაპს არსებულ და პოტენციურ კლიენტებთან წარმოადგენს
          ინფორმაციის წვდომადობა და სანდოობა მოთხოვნად პროდუქციაზე.
        </span>
        <span>
          ჩვენი ჯგუფი დაკომპლექტებულია პროფესიონალებით, რომლებიც ყოველწლიურად
          გადიან გადამზადებას და იღრმავებენ გამოცდილებას, უშუალოდ პარტნიორი
          ფირმების ეგიდით გამართულ ტრენინგებზე.
        </span>
      </p>
    </div>
  );
}

function ContactUs() {
  const company = contactUs.company;
  const contacts = contactUs.contacts;
  const address = contactUs.address;
  return (
    <div>
      <ContactUsInfo contacts={contacts} address={address} />
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
