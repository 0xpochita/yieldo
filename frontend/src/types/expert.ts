export type Token = {
  symbol: string;
  name: string;
  usdPrice: number;
};

export type Chain = {
  id: number;
  name: string;
  shortName: string;
};

export type VaultRisk = "low" | "medium" | "high";

export type VaultStrategy = {
  id: string;
  protocol: string;
  vaultName: string;
  tokenSymbol: string;
  chainShortName: string;
  apy: number;
  tvlUsd: number;
  risk: VaultRisk;
};

export type VaultSortKey = "apy" | "tvl" | "protocol";
