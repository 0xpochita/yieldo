"use client";

import { create } from "zustand";
import { mockChains, mockTokens } from "@/data";
import { fetchVaultsViaProxy, type LifiVault } from "@/lib/lifi-earn";
import { resolveProtocol } from "@/lib/protocol-registry";
import type {
  Chain,
  Token,
  VaultRisk,
  VaultSortKey,
  VaultStrategy,
} from "@/types";

type FetchStatus = "idle" | "loading" | "success" | "error";

export type VaultRiskFilter = VaultRisk | "all";

type ExpertState = {
  token: Token;
  chain: Chain;
  amount: string;
  vaults: VaultStrategy[];
  selectedVaultId: string | null;
  sortBy: VaultSortKey;
  status: FetchStatus;
  error: string | null;
  showOnlyTransactional: boolean;
  riskFilter: VaultRiskFilter;
  protocolFilter: string | null;
  apyMinFilter: number | null;
  tvlMinFilter: number | null;
  setToken: (token: Token) => void;
  setChain: (chain: Chain) => void;
  setAmount: (value: string) => void;
  setSortBy: (sortBy: VaultSortKey) => void;
  setShowOnlyTransactional: (value: boolean) => void;
  setRiskFilter: (filter: VaultRiskFilter) => void;
  setProtocolFilter: (protocolKey: string | null) => void;
  setApyMinFilter: (value: number | null) => void;
  setTvlMinFilter: (value: number | null) => void;
  selectVault: (id: string) => void;
  fetchVaults: () => Promise<void>;
};

let currentController: AbortController | null = null;

function inferRisk(apyPercent: number, tvlUsd: number): VaultRisk {
  if (!Number.isFinite(apyPercent) || apyPercent <= 0) return "medium";

  const whaleTvl = tvlUsd >= 50_000_000;
  const largeTvl = tvlUsd >= 5_000_000;
  const smallTvl = tvlUsd < 1_000_000;

  if (apyPercent >= 40) return "high";
  if (apyPercent >= 20 && !whaleTvl) return "high";
  if (smallTvl && apyPercent >= 10) return "high";

  if (apyPercent >= 12) return "medium";
  if (apyPercent >= 6 && !whaleTvl) return "medium";
  if (smallTvl) return "medium";

  if (largeTvl && apyPercent <= 10) return "low";
  return "low";
}

function resolveChainShortName(chainId: number): string {
  const chain = mockChains.find((item) => item.id === chainId);
  if (chain) return chain.shortName;
  return `Chain ${chainId}`;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function mapVault(vault: LifiVault): VaultStrategy {
  const tvlUsd = toNumber(vault.analytics?.tvl?.usd, 0);
  const apyPercent = toNumber(vault.analytics?.apy?.total, 0);
  const apy30dPercent =
    vault.analytics?.apy30d === null || vault.analytics?.apy30d === undefined
      ? null
      : toNumber(vault.analytics.apy30d, 0);
  const underlying = vault.underlyingTokens?.[0];
  const rawProtocolName = vault.protocol?.name ?? "Unknown";
  const resolved = resolveProtocol(rawProtocolName);
  const apiLogo = vault.protocol?.logoUri ?? vault.protocol?.logoURI;

  return {
    id: `${vault.chainId}:${vault.address}`,
    protocol: resolved.displayName,
    protocolKey: resolved.slug,
    protocolLogoUri: resolved.logoPath ?? apiLogo,
    protocolUrl: vault.protocol?.url,
    vaultName: vault.name,
    vaultAddress: vault.address,
    tokenSymbol: underlying?.symbol ?? "-",
    tokenAddress: underlying?.address ?? "",
    tokenDecimals: underlying?.decimals ?? 18,
    chainId: vault.chainId,
    chainShortName: resolveChainShortName(vault.chainId),
    apy: apyPercent,
    apy30d: apy30dPercent,
    tvlUsd,
    risk: inferRisk(apyPercent, tvlUsd),
    isTransactional: Boolean(vault.isTransactional),
    isRedeemable: Boolean(vault.isRedeemable),
    kyc: Boolean(vault.kyc),
    timeLock: toNumber(vault.timeLock, 0),
    tags: Array.isArray(vault.tags) ? vault.tags : [],
  };
}

export const useExpertStore = create<ExpertState>((set, get) => ({
  token: mockTokens[0],
  chain: mockChains[0],
  amount: "",
  vaults: [],
  selectedVaultId: null,
  sortBy: "apy",
  status: "idle",
  error: null,
  showOnlyTransactional: true,
  riskFilter: "all",
  protocolFilter: null,
  apyMinFilter: null,
  tvlMinFilter: null,
  setToken: (token) => set({ token }),
  setChain: (chain) => set({ chain }),
  setAmount: (amount) => set({ amount }),
  setSortBy: (sortBy) => set({ sortBy }),
  setShowOnlyTransactional: (showOnlyTransactional) =>
    set({ showOnlyTransactional }),
  setRiskFilter: (riskFilter) => set({ riskFilter }),
  setProtocolFilter: (protocolFilter) => set({ protocolFilter }),
  setApyMinFilter: (apyMinFilter) => set({ apyMinFilter }),
  setTvlMinFilter: (tvlMinFilter) => set({ tvlMinFilter }),
  selectVault: (selectedVaultId) => set({ selectedVaultId }),
  fetchVaults: async () => {
    const { token, chain } = get();

    if (currentController) {
      currentController.abort();
    }
    const controller = new AbortController();
    currentController = controller;

    set({ status: "loading", error: null });

    try {
      const response = await fetchVaultsViaProxy(
        {
          chainId: chain.id,
          asset: token.symbol,
          sortBy: "apy",
          limit: 100,
          minTvlUsd: 100_000,
        },
        controller.signal,
      );

      if (controller.signal.aborted) return;

      const vaults = response.data.map(mapVault);
      const firstTransactional = vaults.find((vault) => vault.isTransactional);

      set({
        vaults,
        selectedVaultId: firstTransactional?.id ?? vaults[0]?.id ?? null,
        status: "success",
        error: null,
        protocolFilter: null,
        apyMinFilter: null,
        tvlMinFilter: null,
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      set({
        status: "error",
        error: "We couldn't load vaults right now. Please try again.",
      });
    }
  },
}));
