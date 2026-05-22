import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTrackedEvents,
  configureAnalyticsContext,
  getTrackedEvents,
  setAnalyticsTransport,
  subscribeToTrackedEvents,
  trackEvent
} from "./analytics";

describe("analytics event harness", () => {
  beforeEach(() => {
    clearTrackedEvents();
    configureAnalyticsContext({
      appVersion: "test-version",
      platform: "web",
      entrySource: "toss",
      sessionId: "session-test",
      userKeyStatus: "mock"
    });
    setAnalyticsTransport(undefined);
  });

  it("adds the shared Toss funnel envelope to every event", () => {
    const event = trackEvent("round_start", {
      play_id: "play-1",
      board_id: "daily-1",
      attempt_no: 1,
      ranked_mode: true
    });

    expect(event).toMatchObject({
      eventName: "round_start",
      event_name: "round_start",
      app_version: "test-version",
      platform: "web",
      entry_source: "toss",
      session_id: "session-test",
      user_key_status: "mock",
      properties: {
        play_id: "play-1",
        board_id: "daily-1",
        attempt_no: 1,
        ranked_mode: true
      }
    });
    expect(Date.parse(event.event_time)).not.toBeNaN();
    expect(getTrackedEvents()).toHaveLength(1);
  });

  it("keeps ordered event history for funnel and competition checks", () => {
    trackEvent("app_open", {
      entry_source: "toss",
      toss_app_version: null
    });
    trackEvent("leaderboard_submit", {
      play_id: "play-1",
      score: 1700,
      status: "success",
      error_code: null,
      ranked_mode: true
    });

    expect(getTrackedEvents().map((event) => event.eventName)).toEqual(["app_open", "leaderboard_submit"]);
  });

  it("notifies QA subscribers with live event snapshots", () => {
    const snapshots: string[][] = [];
    const unsubscribe = subscribeToTrackedEvents((events) => {
      snapshots.push(events.map((event) => event.eventName));
    });

    trackEvent("app_open");
    trackEvent("round_start");
    unsubscribe();
    trackEvent("move_commit");

    expect(snapshots).toEqual([[], ["app_open"], ["app_open", "round_start"]]);
  });

  it("sends tracked events to the configured transport", () => {
    const send = vi.fn();
    setAnalyticsTransport({ send });

    const event = trackEvent("app_open");

    expect(send).toHaveBeenCalledWith(event);
  });

  it("keeps gameplay analytics alive when transport throws", () => {
    setAnalyticsTransport({
      send: () => {
        throw new Error("transport unavailable");
      }
    });

    expect(() => trackEvent("round_start")).not.toThrow();
    expect(getTrackedEvents()).toHaveLength(1);
  });

  it("keeps gameplay analytics alive when async transport rejects", async () => {
    const send = vi.fn().mockRejectedValue(new Error("network unavailable"));
    setAnalyticsTransport({ send });

    trackEvent("round_start");
    await Promise.resolve();

    expect(getTrackedEvents()).toHaveLength(1);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
