import React, { useContext } from "react";
import { LangContext } from "LangContext";
import useDocumentMeta from "hooks/useDocumentMeta";
import NotFound from "components/NotFound";
import Footer from "components/Footer";

export default function NotFoundPage() {
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
