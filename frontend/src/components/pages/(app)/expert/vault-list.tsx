"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { useExpertStore } from "@/stores";
import type { VaultRisk, VaultSortKey, VaultStrategy } from "@/types";

const SORT_OPTIONS: { key: VaultSortKey; label: string }[] = [
  { key: "apy", label: "APY" },
  { key: "tvl", label: "TVL" },
  { key: "protocol", label: "Protocol" },
];

const RISK_LABEL: Record<VaultRisk, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const RISK_CLASS: Record<VaultRisk, string> = {
  low: "bg-[rgba(64,182,107,0.12)] text-[var(--color-positive)]",
  medium: "bg-brand-soft text-brand",
  high: "bg-[rgba(250,43,57,0.12)] text-[var(--color-negative)]",
};

function formatTvl(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function sortVaults(
  vaults: VaultStrategy[],
  sortBy: VaultSortKey,
): VaultStrategy[] {
  const next = [...vaults];
  if (sortBy === "apy") next.sort((a, b) => b.apy - a.apy);
  if (sortBy === "tvl") next.sort((a, b) => b.tvlUsd - a.tvlUsd);
  if (sortBy === "protocol") {
    next.sort((a, b) => a.protocol.localeCompare(b.protocol));
  }
  return next;
}

export function VaultList() {
  const vaults = useExpertStore((state) => state.vaults);
  const sortBy = useExpertStore((state) => state.sortBy);
  const selectedVaultId = useExpertStore((state) => state.selectedVaultId);
  const setSortBy = useExpertStore((state) => state.setSortBy);
  const selectVault = useExpertStore((state) => state.selectVault);

  const sorted = useMemo(() => sortVaults(vaults, sortBy), [vaults, sortBy]);
  const best = sorted[0];

  return (
    <section className="rounded-3xl border border-main bg-surface p-3 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <header className="flex items-center justify-between px-3 pt-2">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Routes
          </span>
          <h2 className="text-base font-semibold tracking-tight text-main">
            Vault strategies
          </h2>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surface-raised p-1">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.key === sortBy;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSortBy(option.key)}
                className={
                  isActive
                    ? "rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-main cursor-pointer transition-all duration-200 ease-in-out"
                    : "rounded-full px-3 py-1.5 text-xs font-medium text-muted cursor-pointer transition-all duration-200 ease-in-out hover:text-main"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </header>

      <ul className="mt-3 flex flex-col gap-2">
        {sorted.map((vault) => {
          const isSelected = vault.id === selectedVaultId;
          const isBest = vault.id === best?.id;
          return (
            <li key={vault.id}>
              <button
                type="button"
                onClick={() => selectVault(vault.id)}
                className={
                  isSelected
                    ? "flex w-full items-center justify-between gap-4 rounded-2xl border border-strong bg-surface-raised px-4 py-4 text-left cursor-pointer transition-all duration-200 ease-in-out"
                    : "flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-surface-raised px-4 py-4 text-left cursor-pointer transition-all duration-200 ease-in-out hover:border-main hover:bg-surface-muted"
                }
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                    {vault.protocol.charAt(0)}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-main">
                        {vault.protocol}
                      </span>
                      {isBest ? (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand">
                          BEST
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted">
                      {vault.vaultName} · {vault.chainShortName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-[10px] uppercase tracking-wide text-faint">
                      TVL
                    </span>
                    <span className="text-sm font-medium text-main">
                      {formatTvl(vault.tvlUsd)}
                    </span>
                  </div>
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-[10px] uppercase tracking-wide text-faint">
                      Risk
                    </span>
                    <span
                      className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${RISK_CLASS[vault.risk]}`}
                    >
                      {RISK_LABEL[vault.risk]}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wide text-faint">
                      APY
                    </span>
                    <span className="text-base font-semibold text-brand">
                      {vault.apy.toFixed(2)}%
                    </span>
                  </div>
                  <span
                    className={
                      isSelected
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"
                        : "flex h-6 w-6 items-center justify-center rounded-full border border-main bg-surface text-transparent"
                    }
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 px-1 pb-1">
        <button
          type="button"
          className="w-full rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all duration-200 ease-in-out hover-brand active:scale-[0.98]"
        >
          Deposit into selected vault
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 pb-1">
        <span className="text-[11px] font-medium text-faint">Powered by</span>
        <Image
          src="/Assets/Images/Logo-Brand/logo_lifi_light.svg"
          alt="LI.FI"
          width={14}
          height={14}
          className="invert opacity-80"
        />
        <span className="text-[11px] font-semibold tracking-tight text-muted">
          LI.FI
        </span>
      </div>
    </section>
  );
}
