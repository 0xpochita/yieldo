"use client";

import { create } from "zustand";
import { mockChains, mockTokens } from "@/data";
import { fetchVaultsViaProxy, type LifiVault } from "@/lib/lifi-earn";
import type {
  Chain,
  Token,
  VaultRisk,
  VaultSortKey,
  VaultStrategy,
} from "@/types";

type FetchStatus = "idle" | "loading" | "success" | "error";

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
  setToken: (token: Token) => void;
  setChain: (chain: Chain) => void;
  setAmount: (value: string) => void;
  setSortBy: (sortBy: VaultSortKey) => void;
  setShowOnlyTransactional: (value: boolean) => void;
  selectVault: (id: string) => void;
  fetchVaults: () => Promise<void>;
};

let currentController: AbortController | null = null;

function inferRisk(apyPercent: number): VaultRisk {
  if (!Number.isFinite(apyPercent)) return "medium";
  if (apyPercent >= 15) return "high";
  if (apyPercent >= 7) return "medium";
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
  const apyDecimal = toNumber(vault.analytics?.apy?.total, 0);
  const apyPercent = apyDecimal * 100;
  const apy30dDecimal =
    vault.analytics?.apy30d === null || vault.analytics?.apy30d === undefined
      ? null
      : toNumber(vault.analytics.apy30d, 0);
  const underlying = vault.underlyingTokens?.[0];

  return {
    id: `${vault.chainId}:${vault.address}`,
    protocol: vault.protocol?.name ?? "Unknown",
    protocolLogoUri: vault.protocol?.logoUri ?? vault.protocol?.logoURI,
    protocolUrl: vault.protocol?.url,
    vaultName: vault.name,
    vaultAddress: vault.address,
    tokenSymbol: underlying?.symbol ?? "-",
    tokenAddress: underlying?.address ?? "",
    tokenDecimals: underlying?.decimals ?? 18,
    chainId: vault.chainId,
    chainShortName: resolveChainShortName(vault.chainId),
    apy: apyPercent,
    apy30d: apy30dDecimal !== null ? apy30dDecimal * 100 : null,
    tvlUsd,
    risk: inferRisk(apyPercent),
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
  setToken: (token) => set({ token }),
  setChain: (chain) => set({ chain }),
  setAmount: (amount) => set({ amount }),
  setSortBy: (sortBy) => set({ sortBy }),
  setShowOnlyTransactional: (showOnlyTransactional) =>
    set({ showOnlyTransactional }),
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
          limit: 50,
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
