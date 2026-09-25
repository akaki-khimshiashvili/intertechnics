import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LangContext } from "LangContext";
import { assetUrl, getMachine } from "lib/api";
import { buildSpecLines, formatPrice, machinePhone } from "lib/machineDisplay";
import useDocumentMeta from "hooks/useDocumentMeta";
import Footer from "components/Footer";
import Lightbox from "components/Lightbox";
import NotFound from "components/NotFound";
import { track } from "lib/analytics";
import Reveal from "components/Reveal";

export default function MachineDetail() {
  const { slug } = useParams();
  const { t, lang, localize } = useContext(LangContext);
  const mt = t.machines;

  const [machine, setMachine] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    setMachine(null);
    setNotFound(false);
    setActiveImage(null);
    setLightboxIndex(null);
    getMachine(slug)
      .then(setMachine)
      .catch(() => setNotFound(true));
  }, [slug]);

  const name = machine ? (lang === "en" && machine.name_en ? machine.name_en : machine.name) : "";
  const description = machine
    ? (lang === "en" && machine.description_en ? machine.description_en : machine.description) || ""
    : "";

  useDocumentMeta({
    title: machine
      ? `${(lang === "ka" && machine.meta_title) || name} — Intertechnics LTD`
      : `${notFound ? t.notFound.title : t.machines.machines_title} — Intertechnics LTD`,
    // meta_title/meta_description are written in Georgian in the admin panel.
    description: machine ? (lang === "ka" && machine.meta_description) || description || undefined : undefined,
    image: machine ? assetUrl(machine.main_image) : undefined,
    noindex: notFound,
  });

  if (notFound) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <NotFound />
        </div>
        <Footer />
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="page-shell">
        <div className="container machines-page page-content">
          <p className="machines-loading">{mt.loading}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const specLines = buildSpecLines(machine, mt.field_labels || {});
  const priceLabel = formatPrice(machine, mt);
  const phone = machinePhone(machine);
  const gallery = [machine.main_image, ...(machine.images || [])].filter((img) => assetUrl(img));
  const mainImage = activeImage && gallery.includes(activeImage) ? activeImage : gallery[0];
  const galleryUrls = gallery.map((img) => assetUrl(img));
  const mainImageIndex = Math.max(gallery.indexOf(mainImage), 0);

  return (
    <div className="page-shell">
      <div className="container machines-page machine-detail-page page-content">
        <Link to={localize("/machines")} className="back-home-button" style={{ marginBottom: "20px", display: "inline-block" }}>
          ← {mt.back_to_list}
        </Link>

        <Reveal as="div" className="machine-detail">
          <div className="machine-detail-gallery">
            <button
              type="button"
              className="machine-detail-main-image"
              onClick={() => mainImage && setLightboxIndex(mainImageIndex)}
              aria-label={name}
            >
              {mainImage && <img src={assetUrl(mainImage)} alt={name} decoding="async" />}
            </button>
            {gallery.length > 1 && (
              <div className="machine-detail-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    aria-label={`${name} — ${i + 1} / ${gallery.length}`}
                    aria-pressed={img === mainImage}
                    className={`machine-detail-thumb${img === mainImage ? " machine-detail-thumb-active" : ""}`}
                  >
                    <img src={assetUrl(img)} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="machine-detail-info">
            {(machine.brand || machine.category) && (
              <p className="machine-detail-tag">{[machine.brand, machine.category].filter(Boolean).join(" · ")}</p>
            )}
            <h1>{name}</h1>
            <p className="machine-detail-price">{priceLabel}</p>

            {description && <p className="machine-detail-description">{description}</p>}

            <ul className="machines-specs machine-detail-specs">
              {specLines.map((line, i) => (
                <li key={i}>
                  <span className="spec-label">{line.label}</span>
                  <span className="spec-value">{line.value}</span>
                </li>
              ))}
            </ul>

            <a className="btn-primary" href={phone.href} onClick={() => track("phone_click", { source: "machine_page", lang })}>
              {phone.display}
            </a>
          </div>
        </Reveal>
      </div>
      <Footer />
      {lightboxIndex !== null && (
        <Lightbox
          images={galleryUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => {
            setLightboxIndex(i);
            setActiveImage(gallery[i]);
          }}
        />
      )}
    </div>
  );
}
