import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LangContext } from "LangContext";
import { Phone } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { track } from "lib/analytics";
import Socials from "./Socials";
import logo from "assets/images/logo.png";

export default function Nav() {
  const { t, lang, localize, basePath } = useContext(LangContext);
  const navItems = t.headerElements.navItems;
  const machinesLabel = t.company.machines.name;
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(basePath !== "/");

  // Close the overlay on route change and lock body scroll while it's open.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // The header rides transparent over the hero photo on the home page and
  // solidifies once the hero has scrolled past — other pages have no hero
  // to blend over, so they stay solid from the first paint.
  useEffect(() => {
    if (basePath !== "/") {
      setSolid(true);
      return;
    }
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      setSolid(true);
      return;
    }
    setSolid(false);
    const observer = new IntersectionObserver(([entry]) =>
      setSolid(!entry.isIntersecting),
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [location.pathname, basePath]);

  const handleClick = (element, source = "nav") => {
    if (element.link === "/contact")
      track("contact_click", { source, lang });
    const isHashLink = element.link.startsWith("#");
    if (isHashLink) {
      const scrollToId = element.link.substring(1);
      if (basePath !== "/") {
        navigate(localize("/"), { state: { scrollToId } });
      } else {
        document
          .getElementById(scrollToId)
          ?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(localize(element.link));
    }
    // Same-page hash links don't change location.pathname, so the
    // route-change effect above never fires — close explicitly here too.
    setOpen(false);
  };

  return (
    <>
      <header className={`site-header ${solid ? "is-solid" : ""}`}>
        <div className="site-header-inner container">
          <a
            className="site-header-logo"
            href={localize("/")}
            onClick={(e) => {
              e.preventDefault();
              navigate(localize("/"));
            }}
          >
            <img src={logo} alt="Intertechnics" />
          </a>

          <nav className="site-header-links">
            <ul>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={
                      item.link.startsWith("#")
                        ? item.link
                        : localize(item.link)
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(item);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header-actions">
            <a
              className="nav-phone"
              href="tel:+995599502517"
              onClick={() => track("phone_click", { source: "nav", lang })}
            >
              <Phone width={16} />
              <span>599 50 25 17</span>
            </a>
            <LanguageSwitcher />
            <button
              className={`nav-burger ${open ? "is-open" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-overlay ${open ? "is-open" : ""}`}>
        <ul className="nav-overlay-list">
          {navItems.map((item, i) => (
            <li key={item.id} style={{ transitionDelay: `${i * 60 + 80}ms` }}>
              <a
                href={
                  item.link.startsWith("#") ? item.link : localize(item.link)
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(item, "mobile_menu");
                }}
              >
                {item.name}
              </a>
            </li>
          ))}
          <li style={{ transitionDelay: `${navItems.length * 60 + 80}ms` }}>
            <a
              href={localize("/machines")}
              onClick={(e) => {
                e.preventDefault();
                navigate(localize("/machines"));
                setOpen(false);
              }}
            >
              {machinesLabel}
            </a>
          </li>
        </ul>

        <div
          className="nav-overlay-footer"
          style={{ transitionDelay: `${navItems.length * 60 + 140}ms` }}
        >
          <a
            className="nav-overlay-call"
            href="tel:+995599502517"
            onClick={() =>
              track("phone_click", { source: "mobile_menu", lang })
            }
          >
            <Phone width={18} />
            <span>599 50 25 17</span>
          </a>
          <Socials />
        </div>
      </div>
    </>
  );
}
