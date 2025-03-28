import React from "react";

export default function ContactUsInfoAddress({ address }) {
  return (
    <>
      <div>
        {/* <img src="" alt="" /> */}
        <p className="address-p">{address.head_office}</p>
      </div>
      <div>
        {/* <img src="" alt="" /> */}
        <p className="address-p">{address.service_center}</p>
      </div>
    </>
  );
}
