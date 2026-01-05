/**
 * client/src/main.tsx
 * 
 * Client application entry point.
 * Initializes i18n and renders the root React component.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n/i18n"; // Initialize i18n before React

createRoot(document.getElementById("root")!).render(
  <App />
);
