import React from "react";

export default function HeaderLi({ content, link }) {
  return (
    <li>
      <a className="nav-button" href={link}>
        {content}
      </a>
    </li>
  );
}
