import React from "react";
import ContactUsInfoAddress from "./ContactUsInfoAddress";
import ContactUsInfoContacts from "./ContactUsInfoContacts";
import { Mail } from "lucide-react";

export default function ContactUsInfo({ address, contacts, contactUs }) {
  return (
    <div className="contactUsInfo-div">
      <ContactUsInfoAddress address={address} />
      <ul className="contacts-list">
        {contacts.map((contact, i) => (
          <ContactUsInfoContacts key={contact.id} contact={contact} index={i} />
        ))}
      </ul>
      <a
        className="contact-email"
        href={contactUs.email}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="contact-icon" aria-hidden="true">
          <Mail width={18} />
        </span>
        <span>intertechnicsltd@gmail.com</span>
      </a>
    </div>
  );
}
