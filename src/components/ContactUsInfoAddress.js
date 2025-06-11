import React from "react";
import { Wrench } from "lucide-react";
import { MapPinned } from "lucide-react";

export default function ContactUsInfoAddress({ address }) {
  return (
    <>
      <div>
        <p className="address-p">
          <MapPinned width={22} /> {address.head_office}
        </p>
      </div>
      <div>
        <p className="address-p">
          <Wrench width={22} /> {address.service_center}
        </p>
      </div>
    </>
  );
}
