import React from "react";
import PartnerCompanyElements from "./PartnerCompanyElements";
import Reveal from "./Reveal";

export default function PartnerCompanies({ partnerCompanies }) {
  return (
    <div className="partner-companies-grid">
      {partnerCompanies.map((partnerCompany, i) => (
        <Reveal as="div" index={i} key={partnerCompany.id}>
          <PartnerCompanyElements partnerCompany={partnerCompany} />
        </Reveal>
      ))}
    </div>
  );
}
