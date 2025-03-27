import React from "react";
import ContactUsInfoAddress from "./ContactUsInfoAddress";
import ContactUsInfoContacts from "./ContactUsInfoContacts";

export default function ContactUsInfo({ address, contacts, contactUs }) {
  return (
    <div className="contactUsInfo-div">
      <ContactUsInfoAddress address={address} />
      {contacts.map((contact) => (
        <ContactUsInfoContacts key={contact.id} contact={contact} />
      ))}
      <a href={contactUs.email} target="blanc">
        intertechnicsltd@gmail.com
      </a>
    </div>
  );
}
