import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function PartnerCard({ partnerCompany, visitLabel }) {
  return (
    <a
      className="partner-card"
      href={partnerCompany.website}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="partner-card-logo">
        <img
          src={partnerCompany.companyLogo}
          alt={`${partnerCompany.name} logo`}
          loading="lazy"
        />
      </div>
      <div className="partner-card-body">
        <h2 className="partner-card-name">{partnerCompany.name}</h2>
        <p className="partner-card-desc">{partnerCompany.description}</p>
        <span className="partner-card-link">
          {visitLabel}
          <ArrowUpRight width={16} height={16} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
