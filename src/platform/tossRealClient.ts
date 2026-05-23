import {
  getUserKeyForGame,
  isMinVersionSupported,
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore
} from "@apps-in-toss/web-framework";
import { createAppsInTossClient, type AppsInTossGameBridge } from "./appsInTossClient";
import type { TossClient } from "./tossClient";

export type AppsInTossSdk = AppsInTossGameBridge;

const officialAppsInTossSdk: AppsInTossSdk = {
  getUserKeyForGame,
  isMinVersionSupported,
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore
};

export const createTossRealClient = (sdk: AppsInTossSdk = officialAppsInTossSdk): TossClient =>
  createAppsInTossClient(sdk);
