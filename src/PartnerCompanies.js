import React from "react";
import PartnerCompanyElements from "./PartnerCompanyElements";

export function PartnerCompanies({ partnerCompanies }) {
  return (
    <div>
      {partnerCompanies.map((partnerCompany) => (
        <PartnerCompanyElements
          key={partnerCompany.id}
          partnerCompany={partnerCompany}
        />
      ))}
    </div>
  );
}
