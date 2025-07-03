import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import '@llamaindex/chat-ui/styles/markdown.css';
import '@llamaindex/chat-ui/styles/pdf.css';
import '@llamaindex/chat-ui/styles/editor.css';
import App from "./App";
import { initSettings } from "./api/settings";

initSettings();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
   <App /> 
  </React.StrictMode>,
);