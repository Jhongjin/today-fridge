import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installClientErrorTracking } from "./platform/errorMonitoring";
import { installHttpAnalyticsTransport } from "./platform/httpAnalyticsTransport";
import { installQaAppsInTossBridge } from "./platform/qaTossBridge";
import { App } from "./ui/App";
import "./ui/styles.css";

installClientErrorTracking();
installHttpAnalyticsTransport(import.meta.env.VITE_ANALYTICS_ENDPOINT);
installQaAppsInTossBridge();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
