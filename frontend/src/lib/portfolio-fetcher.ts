import { getBalance, multicall } from "@wagmi/core";
import { formatUnits } from "viem";
import type { Config } from "wagmi";
import type { LifiChainMeta, LifiTokenMeta } from "@/lib/lifi-meta";
import {
  fetchPortfolioViaProxy,
  type LifiPortfolioPosition,
} from "@/lib/lifi-portfolio";

const NATIVE_PLACEHOLDERS = new Set([
  "0x0000000000000000000000000000000000000000",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
]);

const TRACKED_SYMBOLS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "WETH",
  "WBTC",
  "USDC.E",
]);

const BALANCE_OF_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export type PortfolioHolding = {
  chainId: number;
  chainName: string;
  chainLogo?: string;
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUsd: number;
  balance: bigint;
  amount: number;
  valueUsd: number;
  isNative: boolean;
};

export type PortfolioSnapshot = {
  holdings: PortfolioHolding[];
  positions: LifiPortfolioPosition[];
  totalValueUsd: number;
  totalHoldingsUsd: number;
  totalPositionsUsd: number;
};

type MetaInput = {
  chainsById: Record<number, LifiChainMeta>;
  tokensByChain: Record<number, LifiTokenMeta[]>;
};

function toAmount(balance: bigint, decimals: number): number {
  if (balance === 0n) return 0;
  const divisor = 10 ** decimals;
  return Number(balance) / divisor;
}

function toPrice(raw?: string | number | null): number {
  if (raw === undefined || raw === null) return 0;
  const value = typeof raw === "string" ? Number.parseFloat(raw) : raw;
  return Number.isFinite(value) ? value : 0;
}

async function loadChainHoldings(
  config: Config,
  address: `0x${string}`,
  chain: LifiChainMeta,
  tokens: LifiTokenMeta[],
): Promise<PortfolioHolding[]> {
  const holdings: PortfolioHolding[] = [];

  const nativeToken = tokens.find((token) =>
    NATIVE_PLACEHOLDERS.has(token.address.toLowerCase()),
  );

  try {
    const native = await getBalance(config, {
      address,
      chainId: chain.id,
    });
    if (native.value > 0n) {
      const priceUsd = toPrice(nativeToken?.priceUSD);
      const decimals = nativeToken?.decimals ?? native.decimals;
      const amount = Number(formatUnits(native.value, decimals));
      holdings.push({
        chainId: chain.id,
        chainName: chain.name,
        chainLogo: chain.logoURI,
        tokenAddress: nativeToken?.address ?? "native",
        symbol: nativeToken?.symbol ?? native.symbol,
        name: nativeToken?.name ?? native.symbol,
        decimals: nativeToken?.decimals ?? native.decimals,
        logoURI: nativeToken?.logoURI,
        priceUsd,
        balance: native.value,
        amount,
        valueUsd: amount * priceUsd,
        isNative: true,
      });
    }
  } catch {
    // ignore native balance errors per chain
  }

  const tracked = tokens.filter((token) => {
    if (NATIVE_PLACEHOLDERS.has(token.address.toLowerCase())) return false;
    return TRACKED_SYMBOLS.has(token.symbol.toUpperCase());
  });

  if (tracked.length === 0) {
    return holdings;
  }

  try {
    const results = await multicall(config, {
      chainId: chain.id,
      allowFailure: true,
      contracts: tracked.map((token) => ({
        address: token.address as `0x${string}`,
        abi: BALANCE_OF_ABI,
        functionName: "balanceOf",
        args: [address],
      })),
    });

    tracked.forEach((token, index) => {
      const result = results[index];
      if (!result || result.status !== "success") return;
      const value = result.result as bigint;
      if (value === 0n) return;
      const amount = toAmount(value, token.decimals);
      const priceUsd = toPrice(token.priceUSD);
      holdings.push({
        chainId: chain.id,
        chainName: chain.name,
        chainLogo: chain.logoURI,
        tokenAddress: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
        priceUsd,
        balance: value,
        amount,
        valueUsd: amount * priceUsd,
        isNative: false,
      });
    });
  } catch {
    // chain multicall failed; continue
  }

  return holdings;
}

export async function loadPortfolioSnapshot({
  config,
  address,
  meta,
}: {
  config: Config;
  address: `0x${string}`;
  meta: MetaInput;
}): Promise<PortfolioSnapshot> {
  const chains = Object.values(meta.chainsById).filter((chain) =>
    Boolean(meta.tokensByChain[chain.id]?.length),
  );

  const chainResults = await Promise.all(
    chains.map((chain) =>
      loadChainHoldings(
        config,
        address,
        chain,
        meta.tokensByChain[chain.id] ?? [],
      ).catch(() => [] as PortfolioHolding[]),
    ),
  );

  let positions: LifiPortfolioPosition[] = [];
  try {
    const portfolio = await fetchPortfolioViaProxy(address);
    positions = portfolio.positions ?? [];
  } catch {
    positions = [];
  }

  const holdings = chainResults
    .flat()
    .sort((a, b) => b.valueUsd - a.valueUsd);

  const totalHoldingsUsd = holdings.reduce(
    (sum, holding) => sum + holding.valueUsd,
    0,
  );
  const totalPositionsUsd = positions.reduce((sum, position) => {
    const value = Number.parseFloat(position.balanceUsd ?? "0");
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  return {
    holdings,
    positions,
    totalValueUsd: totalHoldingsUsd + totalPositionsUsd,
    totalHoldingsUsd,
    totalPositionsUsd,
  };
}
