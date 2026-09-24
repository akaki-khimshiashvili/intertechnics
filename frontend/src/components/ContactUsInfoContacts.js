import React, { useContext } from "react";
import { Phone } from "lucide-react";
import Reveal from "./Reveal";
import { LangContext } from "../LangContext";
import { track } from "../lib/analytics";

export default function ContactUsInfoContacts({ contact, index = 0 }) {
  const { lang } = useContext(LangContext);
  const telHref = `tel:+995${contact.phone.replace(/\s+/g, "")}`;

  return (
    <Reveal as="li" index={index} className="contacts-div">
      <div className="contacts-p">
        <div className="contacts-p-div">
          <span className="contact-name">{contact.name}</span>
          <span className="contact-position">{contact.position}</span>
        </div>
        <a className="phone-number" href={telHref} onClick={() => track("phone_click", { source: "contact_section", lang })}>
          <Phone width={16} aria-hidden="true" />
          {contact.phone}
        </a>
      </div>
    </Reveal>
  );
}
