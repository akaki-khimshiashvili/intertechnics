import React from "react";

export default function ContactUsInfoContacts({ contact }) {
  return (
    <div className="contacts-div">
      <div className="contacts-div-elements">
        <img />
        <p className="contacts-p">
          {contact.name}, {contact.position}:{" "}
          <span className="phone-number">{contact.phone}</span>
        </p>
      </div>
    </div>
  );
}
