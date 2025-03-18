import React from "react";

export default function PartnerCompanyElements({ partnerCompany }) {
  return (
    <div className="card">
      <img src={partnerCompany.companyLogo} className="card-main-img" alt="" />
    </div>
  );
}
