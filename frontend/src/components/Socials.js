import React, { useContext } from "react";
import { Mail } from "lucide-react";
import { LangContext } from "../LangContext";

const socialLinks = [
  {
    id: 1,
    label: { ka: "Facebook", en: "Facebook" },
    link: "https://www.facebook.com/intertechnicsLTD",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
      </svg>
    ),
  },
  {
    id: 2,
    label: { ka: "ელფოსტა", en: "Email" },
    link: "https://mail.google.com/mail/?view=cm&fs=1&to=intertechnicsltd@gmail.com",
    icon: <Mail width={20} height={20} />,
  },
];

export default function Socials({ className = "" }) {
  const { lang } = useContext(LangContext);

  return (
    <ul className={`socials-ul ${className}`.trim()}>
      {socialLinks.map((item) => (
        <li key={item.id}>
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <span className="icon">{item.icon}</span>
            {/* <span className="socials-label">{item.label[lang] || item.label.en}</span> */}
          </a>
        </li>
      ))}
    </ul>
  );
}
