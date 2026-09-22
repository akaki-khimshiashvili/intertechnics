import React from "react";
import ReactDOM from "react-dom/client";
import { LangProvider } from "./LangContext";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <LangProvider>
    <App />
  </LangProvider>
);
