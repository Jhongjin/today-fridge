type RewardStorage = Pick<Storage, "getItem" | "setItem">;

export type RewardWallet = {
  fridgeCoins: number;
  recipePieces: Record<string, number>;
  claimedRewardIds: string[];
};

export type RewardClaimResult = {
  rewardId: string;
  claimed: boolean;
  coinAmount: number;
  recipePieceAmount: number;
  wallet: RewardWallet;
};

const walletKey = "today-fridge:reward-wallet";

const getDefaultStorage = (): RewardStorage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

const emptyWallet = (): RewardWallet => ({
  fridgeCoins: 0,
  recipePieces: {},
  claimedRewardIds: []
});

const normalizeWallet = (wallet: Partial<RewardWallet>): RewardWallet => ({
  fridgeCoins: Number.isFinite(wallet.fridgeCoins) && Number(wallet.fridgeCoins) > 0 ? Math.floor(Number(wallet.fridgeCoins)) : 0,
  recipePieces: wallet.recipePieces && typeof wallet.recipePieces === "object" ? wallet.recipePieces : {},
  claimedRewardIds: Array.isArray(wallet.claimedRewardIds) ? wallet.claimedRewardIds : []
});

export const completionRewardId = (boardId: string) => `${boardId}:completion-reward`;
export const participationRewardId = (boardId: string) => `${boardId}:participation-reward`;

export const readRewardWallet = (storage = getDefaultStorage()): RewardWallet => {
  if (!storage) {
    return emptyWallet();
  }

  try {
    const rawValue = storage.getItem(walletKey);
    return rawValue ? normalizeWallet(JSON.parse(rawValue)) : emptyWallet();
  } catch {
    return emptyWallet();
  }
};

const writeRewardWallet = (wallet: RewardWallet, storage = getDefaultStorage()) => {
  storage?.setItem(walletKey, JSON.stringify(wallet));
};

export const hasClaimedCompletionReward = (boardId: string, wallet: RewardWallet): boolean =>
  wallet.claimedRewardIds.includes(completionRewardId(boardId));

export const hasClaimedParticipationReward = (boardId: string, wallet: RewardWallet): boolean =>
  wallet.claimedRewardIds.includes(participationRewardId(boardId));

export const claimCompletionReward = (
  boardId: string,
  recipeId: string,
  storage = getDefaultStorage()
): RewardClaimResult => {
  const rewardId = completionRewardId(boardId);
  const wallet = readRewardWallet(storage);

  if (wallet.claimedRewardIds.includes(rewardId)) {
    return {
      rewardId,
      claimed: false,
      coinAmount: 0,
      recipePieceAmount: 0,
      wallet
    };
  }

  const coinAmount = 30;
  const recipePieceAmount = 1;
  const nextWallet: RewardWallet = {
    fridgeCoins: wallet.fridgeCoins + coinAmount,
    recipePieces: {
      ...wallet.recipePieces,
      [recipeId]: (wallet.recipePieces[recipeId] ?? 0) + recipePieceAmount
    },
    claimedRewardIds: [...wallet.claimedRewardIds, rewardId]
  };

  writeRewardWallet(nextWallet, storage);

  return {
    rewardId,
    claimed: true,
    coinAmount,
    recipePieceAmount,
    wallet: nextWallet
  };
};

export const claimParticipationReward = (boardId: string, storage = getDefaultStorage()): RewardClaimResult => {
  const rewardId = participationRewardId(boardId);
  const wallet = readRewardWallet(storage);

  if (wallet.claimedRewardIds.includes(rewardId)) {
    return {
      rewardId,
      claimed: false,
      coinAmount: 0,
      recipePieceAmount: 0,
      wallet
    };
  }

  const coinAmount = 10;
  const nextWallet: RewardWallet = {
    ...wallet,
    fridgeCoins: wallet.fridgeCoins + coinAmount,
    claimedRewardIds: [...wallet.claimedRewardIds, rewardId]
  };

  writeRewardWallet(nextWallet, storage);

  return {
    rewardId,
    claimed: true,
    coinAmount,
    recipePieceAmount: 0,
    wallet: nextWallet
  };
};
