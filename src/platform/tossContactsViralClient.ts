import { contactsViral } from "@apps-in-toss/web-framework";

type Cleanup = () => void;

export type ContactsViralRewardEvent = {
  type: "sendViral";
  data: {
    rewardAmount: number;
    rewardUnit: string;
  };
};

export type ContactsViralCloseEvent = {
  type: "close";
  data: {
    closeReason: "clickBackButton" | "noReward";
    sentRewardAmount?: number;
    sendableRewardsCount?: number;
    sentRewardsCount: number;
    rewardUnit?: string;
  };
};

export type ContactsViralEvent = ContactsViralRewardEvent | ContactsViralCloseEvent;

export type AppsInTossContactsViralBridge = (args: {
  options: { moduleId: string };
  onEvent: (event: ContactsViralEvent) => void;
  onError: (error: unknown) => void;
}) => Cleanup;

export type ContactsViralClientResult =
  | {
      ok: true;
      rewardAmount: number;
      rewardUnit: string;
    }
  | {
      ok: false;
      errorCode: string;
    };

export type ContactsViralClient = {
  open: (moduleId: string) => Promise<ContactsViralClientResult>;
};

const normalizeError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export const createTossContactsViralClient = (
  bridge: AppsInTossContactsViralBridge = contactsViral,
  timeoutMs = 15000
): ContactsViralClient => ({
  async open(moduleId) {
    const normalizedModuleId = moduleId.trim();

    if (!normalizedModuleId) {
      return { ok: false, errorCode: "CONTACTS_VIRAL_MODULE_ID_MISSING" };
    }

    return new Promise((resolve) => {
      let settled = false;
      let cleanup: Cleanup | undefined;
      const finish = (result: ContactsViralClientResult) => {
        if (settled) {
          return;
        }

        settled = true;
        globalThis.clearTimeout(timer);
        cleanup?.();
        resolve(result);
      };
      const timer = globalThis.setTimeout(
        () => finish({ ok: false, errorCode: "CONTACTS_VIRAL_TIMEOUT" }),
        timeoutMs
      );

      try {
        cleanup = bridge({
          options: { moduleId: normalizedModuleId },
          onEvent: (event) => {
            if (event.type === "sendViral") {
              finish({
                ok: true,
                rewardAmount: event.data.rewardAmount,
                rewardUnit: event.data.rewardUnit
              });
              return;
            }

            if (event.data.closeReason === "noReward") {
              finish({ ok: false, errorCode: "CONTACTS_VIRAL_NO_REWARD" });
              return;
            }

            finish({ ok: false, errorCode: "CONTACTS_VIRAL_CLOSED" });
          },
          onError: (error) => finish({ ok: false, errorCode: normalizeError(error, "CONTACTS_VIRAL_ERROR") })
        });
        if (settled) {
          cleanup?.();
        }
      } catch (error) {
        finish({ ok: false, errorCode: normalizeError(error, "CONTACTS_VIRAL_ERROR") });
      }
    });
  }
});
