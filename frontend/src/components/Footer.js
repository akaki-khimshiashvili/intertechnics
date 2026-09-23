import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LangContext } from "../LangContext";
import kkIcon from "../kk-icon.png";
import Socials from "./Socials";

export default function Footer() {
  const { t } = useContext(LangContext);
  const navItems = t.headerElements.navItems;
  const machinesLabel = t.company.machines.name;
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (element) => {
    const isHashLink = element.link.startsWith("#");
    if (isHashLink) {
      const scrollToId = element.link.substring(1);
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollToId } });
      } else {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(element.link);
    }
  };

  return (
    <footer className="footer container">
      <nav className="footer-links">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(item);
                }}
              >
                {item.name}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/machines"
              onClick={(e) => {
                e.preventDefault();
                navigate("/machines");
              }}
            >
              {machinesLabel}
            </a>
          </li>
        </ul>
      </nav>
      <Socials />
      <p className="footer-copyright">
        <span className="copyright">&copy;</span> 2005 – {new Date().getFullYear()} — Intertechnics LTD
      </p>
      <a
        className="footer-credit"
        href="https://akaki-khimshiashvili.github.io/Portfolio/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Powered by</span>
        <img src={kkIcon} alt="KK" />
      </a>
    </footer>
  );
}
