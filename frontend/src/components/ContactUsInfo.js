import React from "react";
import ContactUsInfoAddress from "./ContactUsInfoAddress";
import ContactUsInfoContacts from "./ContactUsInfoContacts";
import { Mail } from "lucide-react";

export default function ContactUsInfo({ address, contacts, contactUs }) {
  return (
    <div className="contactUsInfo-div">
      <ContactUsInfoAddress address={address} />
      {contacts.map((contact, i) => (
        <ContactUsInfoContacts key={contact.id} contact={contact} index={i} />
      ))}
      <a href={contactUs.email} target="_blank" rel="noopener noreferrer">
        <Mail width={20} /> <span>intertechnicsltd@gmail.com</span>
      </a>
    </div>
  );
}
