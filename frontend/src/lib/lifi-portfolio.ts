export type LifiPortfolioAsset = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type LifiPortfolioPosition = {
  chainId: number;
  protocolName: string;
  asset: LifiPortfolioAsset;
  balanceUsd: string;
  balanceNative: string;
};

export type LifiPortfolioResponse = {
  positions: LifiPortfolioPosition[];
};

export async function fetchPortfolioViaProxy(
  address: string,
  signal?: AbortSignal,
): Promise<LifiPortfolioResponse> {
  const url = new URL(
    `/api/earn/portfolio/${address}`,
    window.location.origin,
  );
  const response = await fetch(url.toString(), {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`portfolio_fetch_failed_${response.status}`);
  }

  return (await response.json()) as LifiPortfolioResponse;
}
