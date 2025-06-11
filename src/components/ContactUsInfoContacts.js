import React from "react";
import { Phone } from "lucide-react";

export default function ContactUsInfoContacts({ contact }) {
  return (
    <div className="contacts-div">
      <div className="contacts-div-elements">
        <img src="" alt="" />
        <p className="contacts-p">
          <div className="contacts-p-div">
            <Phone width={22} />
            {contact.name}, {contact.position}:{" "}
          </div>
          <span className="phone-number">{contact.phone}</span>
        </p>
      </div>
    </div>
  );
}
