"use client";

import {
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiInbox,
  FiZap,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import type { VaultRiskFilter } from "@/stores";
import { useDepositStore, useExpertStore, useMetaStore } from "@/stores";
import type { VaultRisk, VaultSortKey, VaultStrategy } from "@/types";
import { IdleAggregatorCard } from "./idle-aggregator-card";

const RISK_FILTERS: { key: VaultRiskFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

function RiskFilterChips({
  active,
  counts,
  onSelect,
}: {
  active: VaultRiskFilter;
  counts: Record<VaultRisk, number>;
  onSelect: (filter: VaultRiskFilter) => void;
}) {
  const total = counts.low + counts.medium + counts.high;
  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-raised p-1">
      {RISK_FILTERS.map((option) => {
        const isActive = option.key === active;
        const count =
          option.key === "all" ? total : (counts[option.key as VaultRisk] ?? 0);
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className={
              isActive
                ? "flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-main cursor-pointer transition-colors"
                : "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted cursor-pointer transition-colors hover:text-main"
            }
          >
            {option.label}
            <span className="text-[9px] text-faint">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

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
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatApy(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

function formatTimelock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const days = seconds / 86_400;
  if (days >= 1) return `${days.toFixed(0)}d lock`;
  const hours = seconds / 3_600;
  if (hours >= 1) return `${hours.toFixed(0)}h lock`;
  return `${Math.round(seconds / 60)}m lock`;
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

const SKELETON_ROWS = Array.from({ length: 5 }, (_, i) => i);

function SkeletonList() {
  return (
    <motion.ul
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 flex flex-col gap-2"
    >
      {SKELETON_ROWS.map((index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-raised px-4 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-10 w-10 rounded-full bg-surface-muted"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="flex flex-col gap-2">
                <motion.div
                  className="h-3 w-28 rounded-full bg-surface-muted"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.6,
                    delay: 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-2.5 w-44 rounded-full bg-surface-muted"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 1.6,
                    delay: 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <motion.div
                className="hidden h-6 w-14 rounded-full bg-surface-muted sm:block"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{
                  duration: 1.6,
                  delay: 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="hidden h-6 w-14 rounded-full bg-surface-muted sm:block"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{
                  duration: 1.6,
                  delay: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-7 w-16 rounded-full bg-surface-muted"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.6,
                  delay: 0.55,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised px-6 py-10 text-center"
    >
      <FiInbox className="h-6 w-6 text-muted" />
      <p className="text-sm font-semibold text-main">No vaults available</p>
      <p className="max-w-xs text-xs text-muted">
        Try another token or chain — we couldn&apos;t find routes for this
        combination on LI.FI Earn.
      </p>
    </motion.div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(250,43,57,0.35)] bg-[rgba(250,43,57,0.08)] px-6 py-10 text-center"
    >
      <FiAlertTriangle className="h-6 w-6 text-[var(--color-negative)]" />
      <p className="text-sm font-semibold text-main">Something went wrong</p>
      <p className="max-w-xs text-xs text-muted">{message}</p>
    </motion.div>
  );
}

export function VaultList() {
  const vaults = useExpertStore((state) => state.vaults);
  const sortBy = useExpertStore((state) => state.sortBy);
  const selectedVaultId = useExpertStore((state) => state.selectedVaultId);
  const status = useExpertStore((state) => state.status);
  const error = useExpertStore((state) => state.error);
  const token = useExpertStore((state) => state.token);
  const chain = useExpertStore((state) => state.chain);
  const amount = useExpertStore((state) => state.amount);
  const showOnlyTransactional = useExpertStore(
    (state) => state.showOnlyTransactional,
  );
  const riskFilter = useExpertStore((state) => state.riskFilter);
  const setSortBy = useExpertStore((state) => state.setSortBy);
  const setShowOnlyTransactional = useExpertStore(
    (state) => state.setShowOnlyTransactional,
  );
  const setRiskFilter = useExpertStore((state) => state.setRiskFilter);
  const selectVault = useExpertStore((state) => state.selectVault);
  const fetchVaults = useExpertStore((state) => state.fetchVaults);
  const openDepositSheet = useDepositStore((state) => state.openSheet);
  const chainsById = useMetaStore((state) => state.chainsById);
  const protocolsByName = useMetaStore((state) => state.protocolsByName);
  const loadMeta = useMetaStore((state) => state.loadMeta);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parsedAmount = Number.parseFloat(amount || "0");
  const amountIsValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  useEffect(() => {
    if (!amountIsValid) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchVaults();
    }, 450);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [token, chain, amountIsValid, fetchVaults]);

  const filtered = useMemo(() => {
    const base = showOnlyTransactional
      ? vaults.filter((vault) => vault.isTransactional)
      : vaults;
    if (riskFilter === "all") return base;
    return base.filter((vault) => vault.risk === riskFilter);
  }, [vaults, showOnlyTransactional, riskFilter]);

  const riskCounts = useMemo(() => {
    const base = showOnlyTransactional
      ? vaults.filter((vault) => vault.isTransactional)
      : vaults;
    return base.reduce(
      (acc, vault) => {
        acc[vault.risk] = (acc[vault.risk] ?? 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 } as Record<VaultRisk, number>,
    );
  }, [vaults, showOnlyTransactional]);

  const sorted = useMemo(
    () => sortVaults(filtered, sortBy),
    [filtered, sortBy],
  );
  const best = sorted[0];
  const selectedVault = useMemo(
    () => sorted.find((vault) => vault.id === selectedVaultId) ?? null,
    [sorted, selectedVaultId],
  );
  const isLoading = status === "idle" || status === "loading";
  const hasError = status === "error";
  const hasData = status === "success" && sorted.length > 0;
  const isEmpty = status === "success" && sorted.length === 0;

  const hasValidAmount = amountIsValid;
  const depositDisabled =
    !hasData ||
    !selectedVault ||
    !selectedVault.isTransactional ||
    !hasValidAmount;

  function handleDepositClick() {
    if (!selectedVault || !hasValidAmount) return;
    openDepositSheet({
      vault: selectedVault,
      token,
      chain,
      amount,
    });
  }

  if (!hasValidAmount) {
    return <IdleAggregatorCard />;
  }

  return (
    <section className="rounded-3xl border border-main bg-surface p-3 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <header className="flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-brand-soft">
            <Image
              src="/Assets/Images/Logo-Brand/yieldo-logo.png"
              alt="Yieldo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain rounded-full"
            />
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Routes
            </span>
            <h2 className="text-base font-semibold tracking-tight text-main">
              Vault Aggregator
            </h2>
          </div>
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

      <div className="mt-2 flex flex-col gap-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            {hasData ? (
              <>
                <span>
                  {sorted.length} route{sorted.length === 1 ? "" : "s"} via
                </span>
                <Image
                  src="/Assets/Images/Logo-Brand/logo_lifi_light.svg"
                  alt="LI.FI"
                  width={12}
                  height={12}
                  className="invert opacity-80"
                />
                <span className="font-semibold text-main">LI.FI Earn</span>
              </>
            ) : (
              <span>Discovering vault routes</span>
            )}
          </span>
          <RiskFilterChips
            active={riskFilter}
            counts={riskCounts}
            onSelect={setRiskFilter}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowOnlyTransactional(!showOnlyTransactional)}
          className="flex items-center gap-1.5 self-start rounded-full bg-surface-raised px-3 py-1 text-[11px] font-semibold text-muted cursor-pointer transition-colors duration-200 hover:text-main"
        >
          <motion.span
            className={`flex h-3 w-3 items-center justify-center rounded-full ${showOnlyTransactional ? "bg-brand" : "bg-surface-muted"}`}
            animate={{ scale: showOnlyTransactional ? 1 : 0.85 }}
          >
            {showOnlyTransactional ? (
              <FiCheck className="h-2 w-2 text-white" />
            ) : null}
          </motion.span>
          One-click deposit only
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <SkeletonList key="skeleton" />
        ) : hasError ? (
          <ErrorState
            key="error"
            message={error ?? "Unable to reach LI.FI Earn."}
          />
        ) : isEmpty ? (
          <EmptyState key="empty" />
        ) : hasData ? (
          <motion.ul
            key="data"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1"
          >
            {sorted.map((vault, index) => {
              const isSelected = vault.id === selectedVaultId;
              const isBest = vault.id === best?.id;
              const protocolMeta =
                protocolsByName[vault.protocolKey] ??
                protocolsByName[
                  vault.protocol.toLowerCase().replace(/\s+/g, "-")
                ];
              const protocolLogoUri =
                vault.protocolLogoUri ??
                protocolMeta?.logoUri ??
                protocolMeta?.logoURI;
              const chainLogo = chainsById[vault.chainId]?.logoURI;
              const showAvg30d =
                vault.apy30d !== null &&
                Math.abs(vault.apy30d - vault.apy) > 0.05;
              const timelockLabel = formatTimelock(vault.timeLock);

              return (
                <motion.li
                  key={vault.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.04,
                    duration: 0.3,
                    ease: "easeOut",
                    layout: { type: "spring", stiffness: 380, damping: 32 },
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectVault(vault.id)}
                    className={
                      isSelected
                        ? "flex w-full items-center justify-between gap-4 rounded-2xl border border-strong bg-surface-raised px-4 py-4 text-left cursor-pointer transition-all duration-200 ease-in-out"
                        : "flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-surface-raised px-4 py-4 text-left cursor-pointer transition-all duration-200 ease-in-out hover:border-main hover:bg-surface-muted"
                    }
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand">
                          {protocolLogoUri ? (
                            <Image
                              src={protocolLogoUri}
                              alt={vault.protocol}
                              width={40}
                              height={40}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            vault.protocol.charAt(0).toUpperCase()
                          )}
                        </span>
                        {chainLogo ? (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-surface-2)] bg-[var(--color-surface-2)]">
                            <Image
                              src={chainLogo}
                              alt={vault.chainShortName}
                              width={16}
                              height={16}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          </span>
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-main">
                            {vault.protocol}
                          </span>
                          {isBest ? (
                            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand">
                              BEST
                            </span>
                          ) : null}
                          {!vault.isTransactional ? (
                            <span
                              title="Not supported by LI.FI Composer"
                              className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted"
                            >
                              VIEW ONLY
                            </span>
                          ) : null}
                        </div>
                        <span className="line-clamp-1 text-xs text-muted">
                          {vault.vaultName} · {vault.chainShortName}
                        </span>
                        {timelockLabel || vault.kyc ? (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {timelockLabel ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                                <FiClock className="h-2.5 w-2.5" />
                                {timelockLabel}
                              </span>
                            ) : null}
                            {vault.kyc ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                                <HiOutlineShieldCheck className="h-2.5 w-2.5" />
                                KYC
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-5">
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
                          {formatApy(vault.apy)}
                        </span>
                        {showAvg30d && vault.apy30d !== null ? (
                          <span className="text-[10px] text-faint">
                            30d · {formatApy(vault.apy30d)}
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={
                          isSelected
                            ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"
                            : "flex h-6 w-6 items-center justify-center rounded-full border border-main bg-surface text-transparent"
                        }
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      <div className="mt-3 px-1 pb-1">
        <button
          type="button"
          onClick={handleDepositClick}
          disabled={depositDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all duration-200 ease-in-out hover-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiZap className="h-4 w-4" />
          {!hasValidAmount
            ? "Enter an amount to continue"
            : selectedVault && !selectedVault.isTransactional
              ? "Selected vault not supported"
              : "Review deposit"}
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
