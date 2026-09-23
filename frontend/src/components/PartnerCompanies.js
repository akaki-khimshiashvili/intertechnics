import React from "react";

// Seconds each logo takes to cross, so speed stays the same however many
// partners there are.
const SECONDS_PER_LOGO = 3.4;

function PartnerLogo({ partnerCompany, hidden }) {
  return (
    <a
      className="partner-logo"
      href={partnerCompany.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <img
        src={partnerCompany.companyLogo}
        alt={hidden ? "" : `${partnerCompany.name} logo`}
        loading="lazy"
      />
    </a>
  );
}

export default function PartnerCompanies({ partnerCompanies }) {
  // The track holds the set twice; animating to -50% scrolls exactly one
  // copy off, where the second copy sits where the first began — a seamless
  // loop. The duplicate is hidden from screen readers and tab order.
  return (
    <div className="partner-marquee">
      <div
        className="partner-marquee-track"
        style={{
          animationDuration: `${partnerCompanies.length * SECONDS_PER_LOGO}s`,
        }}
      >
        {partnerCompanies.map((partnerCompany) => (
          <PartnerLogo key={partnerCompany.id} partnerCompany={partnerCompany} />
        ))}
        {partnerCompanies.map((partnerCompany) => (
          <PartnerLogo
            key={`dup-${partnerCompany.id}`}
            partnerCompany={partnerCompany}
            hidden
          />
        ))}
      </div>
    </div>
  );
}
