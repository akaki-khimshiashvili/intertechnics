import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faGooglePlusG,
} from "@fortawesome/free-brands-svg-icons";

const socialLinks = [
  { id: 1, icon: faFacebookF, link: "#" },
  { id: 2, icon: faTwitter, link: "#" },
  { id: 3, icon: faLinkedinIn, link: "#" },
  { id: 4, icon: faGooglePlusG, link: "#" },
];
export default function Socials() {
  return (
    <ul className="socials-ul">
      {socialLinks.map((item) => (
        <li key={item.id}>
          <a href={item.link}>
            <FontAwesomeIcon icon={item.icon} className="icon" />
          </a>
        </li>
      ))}
    </ul>
  );
}
