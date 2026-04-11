export type LifiChainMeta = {
  id: number;
  key: string;
  name: string;
  logoURI?: string;
  chainType: string;
  nativeToken?: {
    symbol: string;
    logoURI?: string;
  };
};

export type LifiTokenMeta = {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  logoURI?: string;
  priceUSD?: string;
};

export type LifiProtocolMeta = {
  name: string;
  logoUri?: string;
  logoURI?: string;
  url?: string;
};

export type LifiMetaResponse = {
  chains?: LifiChainMeta[];
  tokens?: Record<string, LifiTokenMeta[]>;
  protocols?: LifiProtocolMeta[];
};

export async function fetchLifiMeta(
  signal?: AbortSignal,
): Promise<LifiMetaResponse> {
  const url = new URL("/api/lifi/meta", window.location.origin);
  const response = await fetch(url.toString(), {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`lifi_meta_failed_${response.status}`);
  }

  return (await response.json()) as LifiMetaResponse;
}
