import React from "react";

export default function PartnerCompanyElements({ partnerCompany }) {
  return (
    <div className="card">
      <img src={partnerCompany.imageUrl} className="card-main-img" alt="" />
      <div className="card-details">
        <div className="company-card-name">
          <h2>{partnerCompany.name}</h2>
          <img
            src={partnerCompany.logoImageUrl}
            className="company-img"
            alt=""
          />
        </div>
        <div className="about-company-div">
          <p>{partnerCompany.description}</p>
          <a href={partnerCompany.website}>
            <em>{partnerCompany.website}</em>
          </a>
        </div>
      </div>
    </div>
  );
}
