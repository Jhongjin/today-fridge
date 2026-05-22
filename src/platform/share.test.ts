import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearTrackedEvents, getTrackedEvents } from "./analytics";
import { createResultShareService, type ShareClient } from "./share";

describe("result share service", () => {
  beforeEach(() => {
    clearTrackedEvents();
  });

  it("shares a score result and tracks the competition event", async () => {
    const client: ShareClient = {
      share: vi.fn(async () => ({ ok: true }))
    };
    const service = createResultShareService(client);

    const result = await service.shareResult({
      playId: "play-1",
      score: 1700,
      boardTitle: "오늘의 김치볶음밥 냉파",
      rankedMode: true,
      url: "https://example.com"
    });

    expect(result).toEqual({ ok: true });
    expect(client.share).toHaveBeenCalledWith({
      title: "오늘의 김치볶음밥 냉파",
      text: "오늘의 김치볶음밥 냉파 1,700점! 오늘 냉장고에 도전해봐.",
      url: "https://example.com"
    });
    expect(getTrackedEvents()).toContainEqual(
      expect.objectContaining({
        eventName: "result_share",
        properties: expect.objectContaining({
          play_id: "play-1",
          score: 1700,
          status: "success",
          error_code: null,
          ranked_mode: true
        })
      })
    );
  });

  it("tracks share failures without awarding anything", async () => {
    const client: ShareClient = {
      share: vi.fn(async () => ({ ok: false, errorCode: "WEB_SHARE_UNAVAILABLE" }))
    };
    const service = createResultShareService(client);

    const result = await service.shareResult({
      playId: "play-2",
      score: 500,
      boardTitle: "오늘의 김치볶음밥 냉파",
      rankedMode: false
    });

    expect(result).toEqual({ ok: false, errorCode: "WEB_SHARE_UNAVAILABLE" });
    expect(getTrackedEvents()[0]).toMatchObject({
      eventName: "result_share",
      properties: {
        play_id: "play-2",
        score: 500,
        status: "error",
        error_code: "WEB_SHARE_UNAVAILABLE",
        ranked_mode: false
      }
    });
  });
});
