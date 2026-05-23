import { grantPromotionRewardForGame } from "@apps-in-toss/web-framework";

export type TossPromotionRewardGrantRequest = {
  promotionCode: string;
  amount: number;
};

export type TossPromotionRewardGrantResult =
  | {
      ok: true;
      key: string;
    }
  | {
      ok: false;
      errorCode: string;
      message?: string;
    };

export type AppsInTossPromotionRewardBridge = (args: {
  params: {
    promotionCode: string;
    amount: number;
  };
}) => Promise<unknown>;

const officialPromotionBridge: AppsInTossPromotionRewardBridge = grantPromotionRewardForGame;

const normalizeAmount = (amount: number) => (Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0);

export const grantTossPromotionRewardForGame = async (
  { amount, promotionCode }: TossPromotionRewardGrantRequest,
  bridge: AppsInTossPromotionRewardBridge = officialPromotionBridge
): Promise<TossPromotionRewardGrantResult> => {
  const normalizedPromotionCode = promotionCode.trim();
  const normalizedAmount = normalizeAmount(amount);

  if (!normalizedPromotionCode) {
    return { ok: false, errorCode: "PROMOTION_CODE_MISSING" };
  }

  if (normalizedAmount <= 0) {
    return { ok: false, errorCode: "PROMOTION_AMOUNT_INVALID" };
  }

  try {
    const result = await bridge({
      params: {
        promotionCode: normalizedPromotionCode,
        amount: normalizedAmount
      }
    });

    if (!result) {
      return { ok: false, errorCode: "TOSS_VERSION_UNSUPPORTED" };
    }

    if (result === "ERROR") {
      return { ok: false, errorCode: "TOSS_PROMOTION_ERROR" };
    }

    if (typeof result === "object" && result !== null && "key" in result && typeof result.key === "string") {
      return { ok: true, key: result.key };
    }

    if (typeof result === "object" && result !== null && "errorCode" in result) {
      return {
        ok: false,
        errorCode: String(result.errorCode),
        message: "message" in result ? String(result.message) : undefined
      };
    }

    if (typeof result === "object" && result !== null && "code" in result) {
      return {
        ok: false,
        errorCode: String(result.code)
      };
    }

    return { ok: false, errorCode: "TOSS_PROMOTION_UNRECOGNIZED_RESULT" };
  } catch (error) {
    return {
      ok: false,
      errorCode: error instanceof Error && error.message ? error.message : "TOSS_PROMOTION_EXCEPTION"
    };
  }
};
