import { describe, expect, it, vi } from "vitest";
import { clearTrackedEvents, getTrackedEvents, setAnalyticsTransport, trackEvent } from "./analytics";
import { createHttpAnalyticsTransport, installHttpAnalyticsTransport } from "./httpAnalyticsTransport";

const event = {
  eventName: "app_open",
  event_name: "app_open",
  event_time: "2026-05-22T00:00:00.000Z",
  app_version: "test",
  platform: "web",
  entry_source: "direct",
  session_id: "session",
  user_key_status: "mock",
  properties: {}
} as const;

describe("HTTP analytics transport", () => {
  it("uses sendBeacon when the browser accepts the payload", () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    const fetcher = vi.fn();
    const transport = createHttpAnalyticsTransport({
      endpoint: "/analytics",
      sendBeacon,
      fetcher
    });

    transport.send(event);

    expect(sendBeacon).toHaveBeenCalledWith("/analytics", expect.any(Blob));
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("falls back to fetch keepalive when sendBeacon is unavailable", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const transport = createHttpAnalyticsTransport({
      endpoint: "/analytics",
      sendBeacon: undefined,
      fetcher
    });

    await transport.send(event);

    expect(fetcher).toHaveBeenCalledWith(
      "/analytics",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
        body: JSON.stringify(event)
      })
    );
  });

  it("installs an endpoint-backed transport", () => {
    clearTrackedEvents();
    const originalFetch = globalThis.fetch;
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    globalThis.fetch = fetcher;

    try {
      expect(installHttpAnalyticsTransport("/analytics")).toBe(true);
      trackEvent("app_open");

      expect(getTrackedEvents()).toHaveLength(1);
      expect(fetcher).toHaveBeenCalled();
    } finally {
      setAnalyticsTransport(undefined);
      globalThis.fetch = originalFetch;
    }
  });

  it("does not install a transport without an endpoint", () => {
    expect(installHttpAnalyticsTransport(undefined)).toBe(false);
  });
});
