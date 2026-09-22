import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LangContext } from "../LangContext";
import { assetUrl, getMachine } from "../lib/api";
import { buildSpecLines, formatPrice } from "../lib/machineDisplay";
import useDocumentMeta from "../hooks/useDocumentMeta";
import Footer from "./Footer";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

export default function MachineDetail() {
  const { slug } = useParams();
  const { t, lang } = useContext(LangContext);
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
    title: machine ? `${machine.meta_title || name} — Intertechnics LTD` : t.machines.machines_title,
    description: machine ? machine.meta_description || description || undefined : undefined,
    lang,
    path: `/machines/${slug}`,
    image: machine?.main_image,
  });

  if (notFound) {
    return (
      <div className="page-shell">
        <div className="container machines-page page-content">
          <p className="machines-empty">{mt.no_results}</p>
          <Link to="/machines" className="back-home-button">
            {mt.back_to_list}
          </Link>
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
  const gallery = [machine.main_image, ...(machine.images || [])].filter(Boolean);
  const mainImage = activeImage && gallery.includes(activeImage) ? activeImage : gallery[0];
  const galleryUrls = gallery.map((img) => assetUrl(img));
  const mainImageIndex = Math.max(gallery.indexOf(mainImage), 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || undefined,
    brand: machine.brand ? { "@type": "Brand", name: machine.brand } : undefined,
    image: gallery.map((img) => assetUrl(img)),
    offers:
      machine.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: machine.currency,
            price: machine.price,
            availability:
              machine.status === "available"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          }
        : undefined,
  };

  return (
    <div className="page-shell">
      <div className="container machines-page machine-detail-page page-content">
        <Link to="/machines" className="back-home-button" style={{ marginBottom: "20px", display: "inline-block" }}>
          ← {mt.back_to_list}
        </Link>

        <Reveal as="div" className="machine-detail">
          <div className="machine-detail-gallery">
            <div
              className="machine-detail-main-image"
              role="button"
              tabIndex={0}
              onClick={() => mainImage && setLightboxIndex(mainImageIndex)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && mainImage && setLightboxIndex(mainImageIndex)}
              style={{ backgroundImage: mainImage ? `url(${assetUrl(mainImage)})` : undefined }}
            />
            {gallery.length > 1 && (
              <div className="machine-detail-thumbs">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setActiveImage(img);
                      setLightboxIndex(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setActiveImage(img);
                        setLightboxIndex(i);
                      }
                    }}
                    className={`machine-detail-thumb${img === mainImage ? " machine-detail-thumb-active" : ""}`}
                    style={{ backgroundImage: `url(${assetUrl(img)})` }}
                  />
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

            <a className="btn-primary" href="tel:+995599502517">
              {t.company.contacts[0]?.phone ?? ""}
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
