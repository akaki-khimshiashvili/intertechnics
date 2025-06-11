import React from "react";
import ContactUsInfoAddress from "./ContactUsInfoAddress";
import ContactUsInfoContacts from "./ContactUsInfoContacts";
import { Mail } from "lucide-react";

export default function ContactUsInfo({ address, contacts, contactUs }) {
  return (
    <div className="contactUsInfo-div">
      <ContactUsInfoAddress address={address} />
      {contacts.map((contact) => (
        <ContactUsInfoContacts key={contact.id} contact={contact} />
      ))}
      <a href={contactUs.email} target="blanc">
        <Mail width={22} /> intertechnicsltd@gmail.com
      </a>
    </div>
  );
}
