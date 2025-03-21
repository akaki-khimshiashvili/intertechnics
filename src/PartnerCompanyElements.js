import React from "react";

export default function PartnerCompanyElements({ partnerCompany }) {
  return (
    <div className="card">
      <img src={partnerCompany.companyLogo} className="card-main-img" alt="" />
      <div className="onhover-text">
        <a href={partnerCompany.website} target="blanc">
          <p>
            Visit{" "}
            <span className="onhover-text-span">{partnerCompany.name}</span>
          </p>
        </a>
      </div>
    </div>
  );
}
