import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import {
  installClientErrorTracking,
  reportClientError,
  resetClientErrorTrackingForTest,
  setErrorMonitoringTransport
} from "./errorMonitoring";

describe("error monitoring", () => {
  beforeEach(() => {
    clearTrackedEvents();
    resetClientErrorTrackingForTest();
  });

  afterEach(() => {
    resetClientErrorTrackingForTest();
  });

  it("reports explicit client errors into analytics", () => {
    reportClientError("client_error", {
      message: "boom",
      filename: "app.tsx"
    });

    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "client_error",
      properties: {
        source: "client",
        message: "boom",
        filename: "app.tsx"
      }
    });
  });

  it("sends explicit client errors to the optional error monitoring transport", () => {
    const send = vi.fn();
    setErrorMonitoringTransport({ send });

    const event = reportClientError("client_error", {
      message: "boom",
      filename: "app.tsx"
    });

    expect(send).toHaveBeenCalledWith(event);
  });

  it("swallows error monitoring transport failures", () => {
    setErrorMonitoringTransport({
      send: () => {
        throw new Error("transport failed");
      }
    });

    expect(() =>
      reportClientError("client_error", {
        message: "boom"
      })
    ).not.toThrow();
  });

  it("captures browser error events once installed", () => {
    installClientErrorTracking();

    window.dispatchEvent(
      new ErrorEvent("error", {
        message: "render failed",
        filename: "bundle.js",
        lineno: 10,
        colno: 20
      })
    );

    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "client_error",
      properties: {
        source: "client",
        message: "render failed",
        filename: "bundle.js",
        line_no: 10,
        column_no: 20
      }
    });
  });

  it("captures asset load errors separately", () => {
    installClientErrorTracking();

    const image = document.createElement("img");
    image.src = "https://example.invalid/missing.png";
    document.body.appendChild(image);
    image.dispatchEvent(new Event("error", { bubbles: true }));

    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "asset_load_error",
      properties: {
        source: "client",
        tag_name: "img",
        url: "https://example.invalid/missing.png"
      }
    });
  });
});
