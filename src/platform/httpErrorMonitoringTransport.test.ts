import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportClientError, resetClientErrorTrackingForTest, setErrorMonitoringTransport } from "./errorMonitoring";
import { createHttpErrorMonitoringTransport, installHttpErrorMonitoringTransport } from "./httpErrorMonitoringTransport";

describe("HTTP error monitoring transport", () => {
  beforeEach(() => {
    resetClientErrorTrackingForTest();
  });

  afterEach(() => {
    resetClientErrorTrackingForTest();
  });

  it("posts error monitoring events to a dedicated endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const transport = createHttpErrorMonitoringTransport({
      endpoint: "/errors",
      fetcher,
      sendBeacon: undefined
    });
    const event = reportClientError("client_error", {
      message: "boom"
    });

    await transport.send(event);

    expect(fetcher).toHaveBeenCalledWith(
      "/errors",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
        body: JSON.stringify(event)
      })
    );
  });

  it("installs a dedicated endpoint without requiring the analytics endpoint", () => {
    const originalFetch = globalThis.fetch;
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    globalThis.fetch = fetcher;

    try {
      expect(installHttpErrorMonitoringTransport("/errors")).toBe(true);
      reportClientError("client_error", {
        message: "boom"
      });

      expect(fetcher).toHaveBeenCalled();
    } finally {
      setErrorMonitoringTransport(undefined);
      globalThis.fetch = originalFetch;
    }
  });

  it("does not install without an endpoint", () => {
    expect(installHttpErrorMonitoringTransport(undefined)).toBe(false);
  });
});
