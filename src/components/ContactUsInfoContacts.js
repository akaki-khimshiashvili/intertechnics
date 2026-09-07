import React from "react";
import { Phone } from "lucide-react";
import Reveal from "./Reveal";

export default function ContactUsInfoContacts({ contact, index = 0 }) {
  const telHref = `tel:+995${contact.phone.replace(/\s+/g, "")}`;

  return (
    <Reveal as="div" index={index} className="contacts-div">
      <div className="contacts-p">
        <div className="contacts-p-div">
          <Phone width={18} />
          <span>
            {contact.name}, {contact.position}
          </span>
        </div>
        <a className="phone-number" href={telHref}>
          {contact.phone}
        </a>
      </div>
    </Reveal>
  );
}
