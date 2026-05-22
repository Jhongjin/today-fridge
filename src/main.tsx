import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installClientErrorTracking } from "./platform/errorMonitoring";
import { App } from "./ui/App";
import "./ui/styles.css";

installClientErrorTracking();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
