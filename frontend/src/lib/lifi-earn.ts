export type LifiVaultProtocol = {
  name: string;
  logoUri?: string;
  logoURI?: string;
  url?: string;
};

export type LifiUnderlyingToken = {
  address: string;
  symbol: string;
  decimals: number;
  weight?: number;
};

export type LifiLpToken = {
  address: string;
  symbol: string;
  decimals: number;
  priceUsd?: string;
};

export type LifiRewardToken = {
  address: string;
  symbol: string;
  decimals: number;
};

export type LifiVaultAnalytics = {
  apy: {
    base: number | null;
    reward: number | null;
    total: number;
  };
  apy1d: number | null;
  apy7d: number | null;
  apy30d: number | null;
  tvl: {
    usd: string;
    native?: string;
  };
  updatedAt: string;
};

export type LifiVaultCaps = {
  totalCap?: string;
  maxCap?: string;
};

export type LifiDepositPack = {
  name: string;
  stepsType: "instant" | "complex" | string;
};

export type LifiVault = {
  address: string;
  network: string;
  chainId: number;
  slug: string;
  name: string;
  description?: string | null;
  protocol: LifiVaultProtocol;
  underlyingTokens: LifiUnderlyingToken[];
  lpTokens?: LifiLpToken[];
  rewardTokens?: LifiRewardToken[];
  tags?: string[];
  analytics: LifiVaultAnalytics;
  caps?: LifiVaultCaps;
  timeLock?: number;
  kyc?: boolean;
  provider?: string;
  isTransactional: boolean;
  isRedeemable: boolean;
  depositPacks?: LifiDepositPack[];
  redeemPacks?: LifiDepositPack[];
  syncedAt?: string;
};

export type LifiVaultsResponse = {
  data: LifiVault[];
  nextCursor: string | null;
  total: number;
};

export type FetchVaultsParams = {
  chainId?: number;
  asset?: string;
  protocol?: string;
  minTvlUsd?: number;
  sortBy?: "apy" | "tvl";
  limit?: number;
  cursor?: string;
};

export async function fetchVaultsViaProxy(
  params: FetchVaultsParams,
  signal?: AbortSignal,
): Promise<LifiVaultsResponse> {
  const url = new URL("/api/earn/vaults", window.location.origin);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`vaults_fetch_failed_${response.status}`);
  }

  return (await response.json()) as LifiVaultsResponse;
}
