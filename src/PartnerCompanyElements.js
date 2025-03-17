import React from "react";

export default function PartnerCompanyElements({ partnerCompany }) {
  return (
    <div className="card">
      <img src={partnerCompany.logoImageUrl} className="card-main-img" alt="" />
      <div className="card-details">
        <div className="company-card-name">
          <img
            src={partnerCompany.logoImageUrl}
            className="company-img"
            alt=""
          />
        </div>
        {/* <div className="about-company-div">
          <a href={partnerCompany.website}>
            <em>{partnerCompany.website}</em>
          </a>
        </div> */}
      </div>
    </div>
  );
}
