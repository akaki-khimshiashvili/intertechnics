import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function PartnerCompanyElements({ partnerCompany }) {
  return (
    <a
      className="card"
      href={partnerCompany.website}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={partnerCompany.companyLogo}
        className="card-main-img"
        alt={`${partnerCompany.name} logo`}
      />
      <div className="onhover-text">
        <p>
          <span className="onhover-text-span">{partnerCompany.name}</span>
          <ArrowUpRight width={16} />
        </p>
      </div>
    </a>
  );
}
