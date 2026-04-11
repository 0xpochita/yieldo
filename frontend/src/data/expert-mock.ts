import type { Chain, Token, VaultStrategy } from "@/types";

export const mockTokens: Token[] = [
  { symbol: "USDC", name: "USD Coin", usdPrice: 1 },
  { symbol: "USDT", name: "Tether USD", usdPrice: 1 },
  { symbol: "DAI", name: "Dai Stablecoin", usdPrice: 1 },
  { symbol: "WETH", name: "Wrapped Ether", usdPrice: 2236.26 },
];

export const mockChains: Chain[] = [
  { id: 42161, name: "Arbitrum One", shortName: "Arbitrum" },
  { id: 8453, name: "Base", shortName: "Base" },
  { id: 10, name: "Optimism", shortName: "Optimism" },
  { id: 1, name: "Ethereum", shortName: "Ethereum" },
];

export const mockVaults: VaultStrategy[] = [
  {
    id: "aave-usdc-arb",
    protocol: "Aave v3",
    vaultName: "Core USDC Lending",
    tokenSymbol: "USDC",
    chainShortName: "Arbitrum",
    apy: 8.42,
    tvlUsd: 412_300_000,
    risk: "low",
  },
  {
    id: "morpho-usdc-base",
    protocol: "Morpho Blue",
    vaultName: "Steakhouse USDC",
    tokenSymbol: "USDC",
    chainShortName: "Base",
    apy: 7.91,
    tvlUsd: 128_700_000,
    risk: "low",
  },
  {
    id: "pendle-usdc-arb",
    protocol: "Pendle",
    vaultName: "sUSDe PT Pool",
    tokenSymbol: "USDC",
    chainShortName: "Arbitrum",
    apy: 14.27,
    tvlUsd: 54_200_000,
    risk: "medium",
  },
  {
    id: "compound-usdc-op",
    protocol: "Compound v3",
    vaultName: "Base USDC Market",
    tokenSymbol: "USDC",
    chainShortName: "Optimism",
    apy: 6.18,
    tvlUsd: 89_500_000,
    risk: "low",
  },
  {
    id: "yearn-usdc-arb",
    protocol: "Yearn v3",
    vaultName: "yvUSDC Aggregated",
    tokenSymbol: "USDC",
    chainShortName: "Arbitrum",
    apy: 9.64,
    tvlUsd: 36_800_000,
    risk: "medium",
  },
  {
    id: "beefy-usdc-base",
    protocol: "Beefy",
    vaultName: "Moo Aerodrome USDC",
    tokenSymbol: "USDC",
    chainShortName: "Base",
    apy: 18.93,
    tvlUsd: 12_100_000,
    risk: "high",
  },
];
