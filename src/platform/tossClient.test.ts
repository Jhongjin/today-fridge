import { describe, expect, it } from "vitest";
import { isTossClientErrorCode, toTossClientErrorCode, TOSS_CLIENT_ERROR_CODES } from "./tossClient";

describe("Toss client error codes", () => {
  it("keeps the platform leaderboard failure surface explicit", () => {
    expect(TOSS_CLIENT_ERROR_CODES).toEqual([
      "DUPLICATE_PLAY_ID",
      "LEADERBOARD_NOT_FOUND",
      "PROFILE_NOT_FOUND",
      "TOSS_LEADERBOARD_SUBMIT_EXCEPTION",
      "TOSS_LEADERBOARD_SUBMIT_FAILED",
      "TOSS_SDK_UNAVAILABLE",
      "TOSS_VERSION_UNSUPPORTED",
      "UNPARSABLE_SCORE"
    ]);
  });

  it("normalizes unknown SDK status codes to the generic submit failure", () => {
    expect(isTossClientErrorCode("PROFILE_NOT_FOUND")).toBe(true);
    expect(isTossClientErrorCode("UNKNOWN_STATUS")).toBe(false);
    expect(toTossClientErrorCode("UNKNOWN_STATUS")).toBe("TOSS_LEADERBOARD_SUBMIT_FAILED");
    expect(toTossClientErrorCode(undefined)).toBe("TOSS_LEADERBOARD_SUBMIT_FAILED");
  });
});
