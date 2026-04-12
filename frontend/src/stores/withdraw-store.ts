"use client";

import { create } from "zustand";
import { fetchQuoteViaProxy, type LifiQuoteResponse } from "@/lib/lifi-quote";
import type { LifiPortfolioPosition } from "@/lib/lifi-portfolio";

export type WithdrawStep =
  | "idle"
  | "quoting"
  | "ready"
  | "withdrawing"
  | "success"
  | "error";

const NATIVE_PLACEHOLDER =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as const;

type WithdrawState = {
  open: boolean;
  position: LifiPortfolioPosition | null;
  percentage: number;
  quote: LifiQuoteResponse | null;
  step: WithdrawStep;
  error: string | null;
  txHash: string | null;
  openSheet: (position: LifiPortfolioPosition) => void;
  closeSheet: () => void;
  setPercentage: (percentage: number) => void;
  fetchQuote: (fromAddress: string) => Promise<void>;
  setStep: (step: WithdrawStep) => void;
  setError: (error: string | null) => void;
  setTxHash: (txHash: string | null) => void;
};

let quoteController: AbortController | null = null;

function applyPercentage(
  balanceNative: string,
  percentage: number,
  decimals: number,
): string {
  try {
    const raw = balanceNative || "0";
    const balance = raw.includes(".")
      ? toBigInt(raw, decimals)
      : BigInt(raw);
    if (balance === 0n) return "0";
    const pct = BigInt(Math.max(1, Math.min(100, percentage)));
    return ((balance * pct) / 100n).toString();
  } catch {
    return "0";
  }
}

function toBigInt(decimal: string, decimals: number): bigint {
  const [whole = "0", frac = ""] = decimal.split(".");
  const trimmed = frac.slice(0, decimals).padEnd(decimals, "0");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(trimmed);
}

export const useWithdrawStore = create<WithdrawState>((set, get) => ({
  open: false,
  position: null,
  percentage: 100,
  quote: null,
  step: "idle",
  error: null,
  txHash: null,
  openSheet: (position) => {
    if (quoteController) {
      quoteController.abort();
      quoteController = null;
    }
    set({
      open: true,
      position,
      percentage: 100,
      quote: null,
      step: "idle",
      error: null,
      txHash: null,
    });
  },
  closeSheet: () => {
    if (quoteController) {
      quoteController.abort();
      quoteController = null;
    }
    set({ open: false });
  },
  setPercentage: (percentage) => {
    set({ percentage, quote: null, step: "idle", error: null });
  },
  fetchQuote: async (fromAddress) => {
    const { position, percentage } = get();
    if (!position) {
      set({ step: "error", error: "No position selected" });
      return;
    }

    const fromAmount = applyPercentage(
      position.balanceNative,
      percentage,
      position.asset.decimals,
    );
    if (fromAmount === "0") {
      set({
        step: "error",
        error: "Nothing to withdraw at this percentage.",
      });
      return;
    }

    if (quoteController) {
      quoteController.abort();
    }
    const controller = new AbortController();
    quoteController = controller;

    set({ step: "quoting", error: null });

    try {
      const quote = await fetchQuoteViaProxy(
        {
          fromChain: position.chainId,
          toChain: position.chainId,
          fromToken: position.asset.address,
          toToken: NATIVE_PLACEHOLDER,
          fromAddress,
          fromAmount,
          slippage: 0.005,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      set({ quote, step: "ready", error: null });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const raw = (error as Error).message || "Failed to fetch withdraw quote";
      const short = raw.length > 240 ? `${raw.slice(0, 240)}…` : raw;
      set({ step: "error", error: short });
    }
  },
  setStep: (step) => set({ step }),
  setError: (error) => set({ error }),
  setTxHash: (txHash) => set({ txHash }),
}));
