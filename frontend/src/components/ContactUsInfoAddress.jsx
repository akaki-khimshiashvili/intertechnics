import React from "react";
import { Wrench } from "lucide-react";
import { MapPinned } from "lucide-react";

export default function ContactUsInfoAddress({ address }) {
  return (
    <div className="address-group">
      <div className="address-p">
        <span className="contact-icon" aria-hidden="true">
          <MapPinned width={18} />
        </span>
        <span>{address.head_office}</span>
      </div>
      <div className="address-p">
        <span className="contact-icon" aria-hidden="true">
          <Wrench width={18} />
        </span>
        <span>{address.service_center}</span>
      </div>
    </div>
  );
}
