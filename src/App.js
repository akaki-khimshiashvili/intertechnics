import "./App.css";

function App() {
  return (
    <div>
      <Header />
      <MainBody />
      <PartnerCompanies />
      <AboutUs />
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
      <img src="/images/logo.png" className="logo" alt="logo" />
      <nav>
        <ul className="nav-ul">
          <li>პარტნიორი კომპანიები</li>
          <li>ჩვენ შესახებ</li>
          <li>კონტაქტი</li>
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
        <h1>
          <span className="span-white">ინტერ</span>
          <span className="span-red">ტექნიკსი</span>{" "}
        </h1>
        <p>{pTag}</p>
        <button className="body-elements-button">{button}</button>
      </section>
    </main>
  );
}

function PartnerCompanies() {
  return (
    <div className="partner-companies container">
      <h1 className="partner-company-h1">პარტნიორი კომპანიები</h1>
      <div className="company-components">
        <PartnerCompaniesElements
          img={"/images/bobcat.webp"}
          companyName={"Bobcat"}
          companyImg={"/images/bobcat-logo.png"}
          aboutCompany={`მინი სატვირთელები და ექსკავატორები, ტელესკოპური სატვირთელები და მათი
          დამხმარე მოწყობილობები.`}
          companyLink={`https://www.bobcat.com/cis/en`}
        />
        <PartnerCompaniesElements
          img={"/images/bobcat.webp"}
          companyName={"Bobcat"}
          companyImg={"/images/bobcat-logo.png"}
          aboutCompany={`მინი სატვირთელები და ექსკავატორები, ტელესკოპური სატვირთელები და მათი
          დამხმარე მოწყობილობები.`}
          companyLink={`https://www.bobcat.com/cis/en`}
        />
        <PartnerCompaniesElements
          img={"/images/bobcat.webp"}
          companyName={"Bobcat"}
          companyImg={"/images/bobcat-logo.png"}
          aboutCompany={`მინი სატვირთელები და ექსკავატორები, ტელესკოპური სატვირთელები და მათი
          დამხმარე მოწყობილობები.`}
          companyLink={`https://www.bobcat.com/cis/en`}
        />
      </div>
    </div>
  );
}

function PartnerCompaniesElements({
  img,
  companyName,
  companyImg,
  aboutCompany,
  companyLink,
}) {
  return (
    <div className="card">
      <img src={img} className="card-main-img" alt="img" />
      <div className="card-details">
        <div className="company-card-name">
          <h2>{companyName}</h2>
          <img src={companyImg} className="company-img" alt="img" />
        </div>
        <div className="about-company-div">
          <p>{aboutCompany}</p>
          <a href={companyLink}>
            <em>{companyLink}</em>
          </a>
        </div>
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
      <p>
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

function Footer() {
  return (
    <footer className="footer container">
      &copy; 2005 – {new Date().getFullYear()} — Intertechnics LTD
    </footer>
  );
}

export default App;
