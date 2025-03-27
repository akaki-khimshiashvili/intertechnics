import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faGooglePlusG } from "@fortawesome/free-brands-svg-icons";

const socialLinks = [
  {
    id: 1,
    icon: faFacebookF,
    link: "https://www.facebook.com/intertechnicsLTD",
  },
  {
    id: 2,
    icon: faGooglePlusG,
    link: "https://mail.google.com/mail/?view=cm&fs=1&to=intertechnicsltd@gmail.com",
  },
];
export default function Socials() {
  return (
    <ul className="socials-ul">
      {socialLinks.map((item) => (
        <li key={item.id}>
          <a href={item.link} target="blanc">
            <FontAwesomeIcon icon={item.icon} className="icon" />
          </a>
        </li>
      ))}
    </ul>
  );
}
