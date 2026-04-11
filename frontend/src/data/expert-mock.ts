import type { Chain, Token } from "@/types";

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
