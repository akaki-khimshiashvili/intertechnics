import React from "react";
import { Wrench } from "lucide-react";
import { MapPinned } from "lucide-react";

export default function ContactUsInfoAddress({ address }) {
  return (
    <>
      <div className="address-p">
        <MapPinned width={18} />
        <span>{address.head_office}</span>
      </div>
      <div className="address-p">
        <Wrench width={18} />
        <span>{address.service_center}</span>
      </div>
    </>
  );
}
