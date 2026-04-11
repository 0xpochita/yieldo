"use client";

import { create } from "zustand";
import { mockChains, mockTokens, mockVaults } from "@/data";
import type { Chain, Token, VaultSortKey, VaultStrategy } from "@/types";

type ExpertState = {
  token: Token;
  chain: Chain;
  amount: string;
  vaults: VaultStrategy[];
  selectedVaultId: string;
  sortBy: VaultSortKey;
  setToken: (token: Token) => void;
  setChain: (chain: Chain) => void;
  setAmount: (value: string) => void;
  setSortBy: (sortBy: VaultSortKey) => void;
  selectVault: (id: string) => void;
};

const defaultVault = mockVaults[0];

export const useExpertStore = create<ExpertState>((set) => ({
  token: mockTokens[0],
  chain: mockChains[0],
  amount: "",
  vaults: mockVaults,
  selectedVaultId: defaultVault.id,
  sortBy: "apy",
  setToken: (token) => set({ token }),
  setChain: (chain) => set({ chain }),
  setAmount: (amount) => set({ amount }),
  setSortBy: (sortBy) => set({ sortBy }),
  selectVault: (selectedVaultId) => set({ selectedVaultId }),
}));
