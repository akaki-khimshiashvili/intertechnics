import React from "react";
import PartnerCompanyElements from "./PartnerCompanyElements";

export default function PartnerCompanies({ partnerCompanies }) {
  return (
    <div className="partner-companies-grid">
      {partnerCompanies.map((partnerCompany) => (
        <PartnerCompanyElements
          key={partnerCompany.id}
          partnerCompany={partnerCompany}
        />
      ))}
    </div>
  );
}
