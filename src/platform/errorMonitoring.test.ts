import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { installClientErrorTracking, reportClientError, resetClientErrorTrackingForTest } from "./errorMonitoring";

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
});
