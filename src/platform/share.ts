import { trackEvent } from "./analytics";

export type SharePayload = {
  title: string;
  text: string;
  url?: string;
};

export type ShareClientResult = {
  ok: boolean;
  errorCode?: string;
};

export type ShareClient = {
  share: (payload: SharePayload) => Promise<ShareClientResult>;
};

export type ResultShareRequest = {
  playId: string;
  score: number;
  boardTitle: string;
  rankedMode: boolean;
  url?: string;
};

export type ResultShareResult = {
  ok: boolean;
  errorCode?: string;
};

export const createMockShareClient = (): ShareClient => ({
  async share() {
    return { ok: true };
  }
});

export const createBrowserShareClient = (): ShareClient => ({
  async share(payload) {
    if (!globalThis.navigator?.share) {
      return { ok: false, errorCode: "WEB_SHARE_UNAVAILABLE" };
    }

    try {
      await globalThis.navigator.share(payload);
      return { ok: true };
    } catch {
      return { ok: false, errorCode: "WEB_SHARE_FAILED" };
    }
  }
});

export const createResultShareService = (client: ShareClient) => ({
  async shareResult({ playId, score, boardTitle, rankedMode, url }: ResultShareRequest): Promise<ResultShareResult> {
    const result = await client.share({
      title: boardTitle,
      text: `${boardTitle} ${score.toLocaleString()}점! 오늘 냉장고에 도전해봐.`,
      url
    });

    trackEvent("result_share", {
      play_id: playId,
      score,
      status: result.ok ? "success" : "error",
      error_code: result.errorCode ?? null,
      ranked_mode: rankedMode
    });

    return result.ok ? { ok: true } : { ok: false, errorCode: result.errorCode };
  }
});
