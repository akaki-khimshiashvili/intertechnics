import React from "react";
import { Phone } from "lucide-react";

export default function ContactUsInfoContacts({ contact }) {
  return (
    <div className="contacts-div">
      <div className="contacts-div-elements">
        <div className="contacts-p">
          <div className="contacts-p-div">
            <Phone width={18} />
            <span>
              {contact.name}, {contact.position}
            </span>
          </div>
          <span className="phone-number">{contact.phone}</span>
        </div>
      </div>
    </div>
  );
}
