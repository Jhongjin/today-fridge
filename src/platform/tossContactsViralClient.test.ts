import { describe, expect, it } from "vitest";
import { createTossContactsViralClient, type AppsInTossContactsViralBridge } from "./tossContactsViralClient";

type ContactsViralArgs = Parameters<AppsInTossContactsViralBridge>[0];

const createBridge = (handler: (args: ContactsViralArgs) => void): AppsInTossContactsViralBridge => (args) => {
  handler(args);
  return () => undefined;
};

describe("Toss contacts viral client", () => {
  it("resolves the sendViral reward event", async () => {
    const client = createTossContactsViralClient(
      createBridge(({ onEvent }) =>
        onEvent({
          type: "sendViral",
          data: {
            rewardAmount: 12,
            rewardUnit: "fridge_coin"
          }
        })
      )
    );

    await expect(client.open("module-1")).resolves.toEqual({
      ok: true,
      rewardAmount: 12,
      rewardUnit: "fridge_coin"
    });
  });

  it("normalizes close and no-reward events", async () => {
    const closedClient = createTossContactsViralClient(
      createBridge(({ onEvent }) =>
        onEvent({
          type: "close",
          data: {
            closeReason: "clickBackButton",
            sentRewardsCount: 0
          }
        })
      )
    );
    const noRewardClient = createTossContactsViralClient(
      createBridge(({ onEvent }) =>
        onEvent({
          type: "close",
          data: {
            closeReason: "noReward",
            sentRewardsCount: 0
          }
        })
      )
    );

    await expect(closedClient.open("module-1")).resolves.toEqual({
      ok: false,
      errorCode: "CONTACTS_VIRAL_CLOSED"
    });
    await expect(noRewardClient.open("module-1")).resolves.toEqual({
      ok: false,
      errorCode: "CONTACTS_VIRAL_NO_REWARD"
    });
  });

  it("rejects missing module ids before opening Toss contacts viral", async () => {
    const client = createTossContactsViralClient(createBridge(() => undefined));

    await expect(client.open(" ")).resolves.toEqual({
      ok: false,
      errorCode: "CONTACTS_VIRAL_MODULE_ID_MISSING"
    });
  });
});
