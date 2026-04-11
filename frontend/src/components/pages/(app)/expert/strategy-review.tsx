"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiCheck,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiInbox,
} from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { useExpertStore, useMetaStore } from "@/stores";
import type { VaultRisk, VaultStrategy } from "@/types";

const BLOCK_EXPLORERS: Record<number, string> = {
  1: "https://etherscan.io/address",
  10: "https://optimistic.etherscan.io/address",
  137: "https://polygonscan.com/address",
  8453: "https://basescan.org/address",
  42161: "https://arbiscan.io/address",
};

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

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

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

function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  if (value >= 1_000_000)
    return `$${(value / 1_000_000).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}M`;
  if (value >= 10_000)
    return `$${value.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    })}`;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const PREVIEW_PERIODS: { key: string; label: string; divisor: number }[] = [
  { key: "year", label: "1Y", divisor: 1 },
  { key: "month", label: "1M", divisor: 12 },
  { key: "week", label: "1W", divisor: 52 },
  { key: "day", label: "1D", divisor: 365 },
];

function formatTimelock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "None";
  const days = seconds / 86_400;
  if (days >= 1) return `${days.toFixed(0)}d lock`;
  const hours = seconds / 3_600;
  if (hours >= 1) return `${hours.toFixed(0)}h lock`;
  return `${Math.round(seconds / 60)}m lock`;
}

function explorerUrl(vault: VaultStrategy): string | null {
  const base = BLOCK_EXPLORERS[vault.chainId];
  if (!base) return null;
  return `${base}/${vault.vaultAddress}`;
}

export function StrategyReview() {
  const vaults = useExpertStore((state) => state.vaults);
  const selectedVaultId = useExpertStore((state) => state.selectedVaultId);
  const status = useExpertStore((state) => state.status);
  const amount = useExpertStore((state) => state.amount);
  const chainsById = useMetaStore((state) => state.chainsById);

  const token = useExpertStore((state) => state.token);
  const chain = useExpertStore((state) => state.chain);
  const tokensBySymbol = useMetaStore((state) => state.tokensBySymbol);

  const parsedAmount = Number.parseFloat(amount || "0");
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const principalUsd = hasValidAmount ? parsedAmount * token.usdPrice : 0;
  const tokenLogo =
    tokensBySymbol[chain.id]?.[token.symbol.toUpperCase()]?.logoURI ?? null;

  const vault = useMemo(
    () => vaults.find((item) => item.id === selectedVaultId) ?? null,
    [vaults, selectedVaultId],
  );

  if (!hasValidAmount) {
    return null;
  }

  const isLoading = status === "loading" || status === "idle";

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-main bg-surface p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] mb-10">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
            Strategy review
          </span>
          <h3 className="text-xs font-semibold text-main">
            {vault ? vault.protocol : "Select a vault to continue"}
          </h3>
        </div>
        {vault ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RISK_CLASS[vault.risk]}`}
          >
            {RISK_LABEL[vault.risk]} risk
          </span>
        ) : null}
      </header>

      <AnimatePresence mode="wait">
        {vault ? (
          <ActiveReview
            key={vault.id}
            vault={vault}
            chainLogo={chainsById[vault.chainId]?.logoURI}
            principalUsd={principalUsd}
            tokenLogo={tokenLogo}
            tokenSymbol={token.symbol}
          />
        ) : (
          <EmptyReview key="empty" isLoading={isLoading} />
        )}
      </AnimatePresence>
    </section>
  );
}

function EmptyReview({ isLoading }: { isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised px-6 py-8 text-center"
    >
      <FiInbox className="h-5 w-5 text-muted" />
      <p className="text-xs font-semibold text-main">
        {isLoading ? "Fetching vault strategies…" : "No vault selected yet"}
      </p>
      <p className="max-w-xs text-[11px] text-muted">
        Enter an amount and pick a route from the Vault Aggregator on the right
        to see full strategy details here.
      </p>
    </motion.div>
  );
}

function ActiveReview({
  vault,
  chainLogo,
  principalUsd,
  tokenLogo,
  tokenSymbol,
}: {
  vault: VaultStrategy;
  chainLogo?: string;
  principalUsd: number;
  tokenLogo: string | null;
  tokenSymbol: string;
}) {
  const [copied, setCopied] = useState(false);
  const explorerLink = explorerUrl(vault);
  const vaultLink = vault.protocolUrl ?? null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(vault.vaultAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mt-3 flex flex-1 flex-col gap-3"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-surface-raised p-3">
        <div className="relative h-11 w-11 shrink-0">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand">
            {vault.protocolLogoUri ? (
              <Image
                src={vault.protocolLogoUri}
                alt={vault.protocol}
                width={44}
                height={44}
                className="h-full w-full object-contain"
                unoptimized
              />
            ) : (
              vault.protocol.charAt(0).toUpperCase()
            )}
          </span>
          {chainLogo ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border-2 border-(--color-surface-2) bg-(--color-surface-2)">
              <Image
                src={chainLogo}
                alt={vault.chainShortName}
                width={12}
                height={12}
                className="h-full w-full object-contain"
                unoptimized
              />
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-main">
            {vault.vaultName}
          </span>
          <span className="truncate text-[11px] text-muted">
            {vault.tokenSymbol} · {vault.chainShortName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {vaultLink ? (
            <a
              href={vaultLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open vault page"
              title="Open vault page"
              className="flex h-8 items-center justify-center gap-1 rounded-lg border border-main bg-surface px-2 text-[10px] font-semibold text-muted transition-colors hover:border-strong hover:text-main"
            >
              Vault
              <FiExternalLink className="h-3 w-3" />
            </a>
          ) : null}
          {explorerLink ? (
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open contract in block explorer"
              title="Open contract in block explorer"
              className="flex h-8 items-center justify-center gap-1 rounded-lg border border-main bg-surface px-2 text-[10px] font-semibold text-muted transition-colors hover:border-strong hover:text-main"
            >
              Contract
              <FiExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="APY" value={formatApy(vault.apy)} accent />
        <Stat label="TVL" value={formatTvl(vault.tvlUsd)} />
        <Stat
          label="30d avg APY"
          value={vault.apy30d !== null ? formatApy(vault.apy30d) : "—"}
        />
        <Stat label="Risk tier" value={RISK_LABEL[vault.risk]} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {vault.isTransactional ? (
          <Chip>
            <FiCheck className="h-2.5 w-2.5" />
            One-click deposit
          </Chip>
        ) : (
          <Chip tone="warn">View only</Chip>
        )}
        {vault.timeLock > 0 ? (
          <Chip>
            <FiClock className="h-2.5 w-2.5" />
            {formatTimelock(vault.timeLock)}
          </Chip>
        ) : null}
        {vault.kyc ? (
          <Chip>
            <HiOutlineShieldCheck className="h-2.5 w-2.5" />
            KYC
          </Chip>
        ) : null}
        {vault.tags.slice(0, 2).map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-raised p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] tracking-wide text-faint">
            {tokenLogo ? (
              <Image
                src={tokenLogo}
                alt={tokenSymbol}
                width={14}
                height={14}
                className="h-3.5 w-3.5 rounded-full object-contain"
                unoptimized
              />
            ) : null}
            Your Estimated Balance
          </span>
          <span className="text-[10px] font-semibold text-[#60a5fa]">
            {formatApy(vault.apy)} APY
          </span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {PREVIEW_PERIODS.map((period) => {
            const yieldForPeriod =
              (principalUsd * (vault.apy / 100)) / period.divisor;
            const projected = principalUsd + yieldForPeriod;
            return (
              <div
                key={period.key}
                className="flex flex-col items-start gap-0.5 rounded-xl bg-surface-muted px-2 py-1.5"
              >
                <span className="text-[9px] font-semibold uppercase tracking-wide text-faint">
                  {period.label}
                </span>
                <span className="truncate text-[11px] font-semibold text-main">
                  {formatUsd(projected)}
                </span>
                <span className="truncate text-[9px] text-(--color-positive)">
                  +{formatUsd(yieldForPeriod)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
{/* 
      <div className="mt-auto flex items-center justify-between gap-2 rounded-2xl bg-surface-raised px-3 py-2">
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] uppercase tracking-wide text-faint">
            Vault address
          </span>
          <span className="truncate font-mono text-[11px] text-main">
            {shortenAddress(vault.vaultAddress)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy vault address"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-main text-muted cursor-pointer transition-colors hover:border-strong hover:text-main"
        >
          {copied ? (
            <FiCheck className="h-3.5 w-3.5 text-brand" />
          ) : (
            <FiCopy className="h-3.5 w-3.5" />
          )}
        </button>
      </div> */}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-surface-raised px-3 py-2">
      <span className="text-[9px] uppercase tracking-wide text-faint">
        {label}
      </span>
      <span
        className={
          accent
            ? "text-sm font-semibold text-[#60a5fa]"
            : "text-[13px] font-semibold text-main"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Chip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warn";
}) {
  const base =
    tone === "warn"
      ? "bg-[rgba(250,43,57,0.12)] text-[var(--color-negative)]"
      : "bg-surface-raised text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${base}`}
    >
      {children}
    </span>
  );
}
