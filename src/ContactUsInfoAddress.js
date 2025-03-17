import React from "react";

export default function ContactUsInfoAddress({ address }) {
  return (
    <>
      <div>
        <img />
        <p className="address-p">{address.head_office}</p>
      </div>
      <div>
        <img />
        <p className="address-p">{address.service_center}</p>
      </div>
    </>
  );
}
