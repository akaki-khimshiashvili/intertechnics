import React, { useContext, useEffect, useLayoutEffect } from "react";
import "./styles/tokens.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation, useNavigationType } from "react-router-dom";
import { LangContext, LangProvider } from "./LangContext";
import { track } from "./lib/analytics";

import Nav from "./components/Nav";
import Home from "./pages/Home";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import Partners from "./pages/Partners";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFoundPage from "./pages/NotFoundPage";

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

export default App;
