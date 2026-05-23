import { describe, expect, it } from "vitest";
import { createTossRewardedAdClient, type AppsInTossAdBridge } from "./tossRewardedAdClient";

type LoadArgs = Parameters<AppsInTossAdBridge["loadFullScreenAd"]>[0];
type ShowArgs = Parameters<AppsInTossAdBridge["showFullScreenAd"]>[0];

const createLoadBridge = (handler: (args: LoadArgs) => void, supported = true): AppsInTossAdBridge["loadFullScreenAd"] =>
  Object.assign(
    (args: LoadArgs) => {
      handler(args);
      return () => undefined;
    },
    { isSupported: () => supported }
  );

const createShowBridge = (handler: (args: ShowArgs) => void, supported = true): AppsInTossAdBridge["showFullScreenAd"] =>
  Object.assign(
    (args: ShowArgs) => {
      handler(args);
      return () => undefined;
    },
    { isSupported: () => supported }
  );

const createBridge = (patch: Partial<AppsInTossAdBridge> = {}): AppsInTossAdBridge => ({
  loadFullScreenAd: createLoadBridge(({ onEvent }) => onEvent({ type: "loaded" })),
  showFullScreenAd: createShowBridge(({ onEvent }) =>
    onEvent({ type: "userEarnedReward", data: { unitType: "fridge_coin", unitAmount: 10 } })
  ),
  ...patch
});

describe("Toss rewarded ad client", () => {
  it("loads and shows a full-screen ad through the official bridge shape", async () => {
    const client = createTossRewardedAdClient(
      {
        adGroupIdByPlacement: {
          result_failure: "ad-failure",
          result_completion: "ad-completion",
          recipe_book: "ad-recipe"
        }
      },
      createBridge()
    );

    await expect(client.load("result_failure")).resolves.toEqual({ ok: true });
    await expect(client.show("result_failure")).resolves.toEqual({ completed: true });
  });

  it("normalizes unsupported and missing ad group states", async () => {
    const client = createTossRewardedAdClient(
      {
        adGroupIdByPlacement: {
          result_failure: "",
          result_completion: "ad-completion",
          recipe_book: "ad-recipe"
        }
      },
      createBridge({
        loadFullScreenAd: createLoadBridge(() => undefined, false)
      })
    );

    await expect(client.load("result_failure")).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_AD_GROUP_ID_MISSING"
    });
    await expect(client.load("result_completion")).resolves.toEqual({
      ok: false,
      errorCode: "TOSS_AD_UNSUPPORTED"
    });
  });

  it("treats dismiss without reward as an incomplete ad", async () => {
    const client = createTossRewardedAdClient(
      {
        adGroupIdByPlacement: {
          result_failure: "ad-failure",
          result_completion: "ad-completion",
          recipe_book: "ad-recipe"
        }
      },
      createBridge({
        showFullScreenAd: createShowBridge(({ onEvent }) => onEvent({ type: "dismissed" }))
      })
    );

    await expect(client.show("result_failure")).resolves.toEqual({
      completed: false,
      errorCode: "TOSS_AD_DISMISSED"
    });
  });
});
