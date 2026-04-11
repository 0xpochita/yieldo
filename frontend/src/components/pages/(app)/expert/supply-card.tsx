"use client";

import { FiArrowDown } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { mockChains, mockTokens } from "@/data";
import { useExpertStore, useMetaStore } from "@/stores";
import { Selector } from "./selector";

type YieldPeriod = "year" | "month" | "week" | "day";

const TOKEN_LOGO_FALLBACKS: Record<string, string> = {
  USDT: "/Assets/Images/Logo-Coin/usdt-logo.svg",
};

const YIELD_PERIODS: {
  key: YieldPeriod;
  label: string;
  divisor: number;
  suffix: string;
  title: string;
  hintLabel: string;
  hintDivisor: number;
}[] = [
  {
    key: "year",
    label: "1Y",
    divisor: 1,
    suffix: "/ year",
    title: "Estimated yearly yield",
    hintLabel: "month",
    hintDivisor: 12,
  },
  {
    key: "month",
    label: "1M",
    divisor: 12,
    suffix: "/ month",
    title: "Estimated monthly yield",
    hintLabel: "day",
    hintDivisor: 12 * 30,
  },
  {
    key: "week",
    label: "1W",
    divisor: 52,
    suffix: "/ week",
    title: "Estimated weekly yield",
    hintLabel: "day",
    hintDivisor: 52 * 7,
  },
  {
    key: "day",
    label: "1D",
    divisor: 365,
    suffix: "/ day",
    title: "Estimated daily yield",
    hintLabel: "hour",
    hintDivisor: 365 * 24,
  },
];

function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.00";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SupplyCard() {
  const token = useExpertStore((state) => state.token);
  const chain = useExpertStore((state) => state.chain);
  const amount = useExpertStore((state) => state.amount);
  const vaults = useExpertStore((state) => state.vaults);
  const selectedVaultId = useExpertStore((state) => state.selectedVaultId);
  const setToken = useExpertStore((state) => state.setToken);
  const setChain = useExpertStore((state) => state.setChain);
  const setAmount = useExpertStore((state) => state.setAmount);

  const chainsById = useMetaStore((state) => state.chainsById);
  const tokensBySymbol = useMetaStore((state) => state.tokensBySymbol);
  const loadMeta = useMetaStore((state) => state.loadMeta);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const [yieldPeriod, setYieldPeriod] = useState<YieldPeriod>("year");
  const activePeriod =
    YIELD_PERIODS.find((period) => period.key === yieldPeriod) ??
    YIELD_PERIODS[0];

  const selectedVault = useMemo(
    () => vaults.find((vault) => vault.id === selectedVaultId) ?? null,
    [vaults, selectedVaultId],
  );
  const apyPercent = selectedVault?.apy ?? 0;
  const apyDecimal = apyPercent / 100;

  const amountNumber = Number.parseFloat(amount || "0");
  const usdValue = Number.isFinite(amountNumber)
    ? amountNumber * token.usdPrice
    : 0;
  const estimatedYearly = usdValue * apyDecimal;
  const estimatedForPeriod = estimatedYearly / activePeriod.divisor;
  const hintValue = estimatedYearly / activePeriod.hintDivisor;

  const tokenOptions = useMemo(
    () =>
      mockTokens.map((item) => {
        const symbol = item.symbol.toUpperCase();
        const metaLogo = tokensBySymbol[chain.id]?.[symbol]?.logoURI;
        return {
          key: item.symbol,
          label: item.symbol,
          hint: item.name,
          iconUrl: metaLogo ?? TOKEN_LOGO_FALLBACKS[symbol],
        };
      }),
    [chain.id, tokensBySymbol],
  );

  const chainOptions = useMemo(
    () =>
      mockChains.map((item) => ({
        key: String(item.id),
        label: item.shortName,
        hint: item.name,
        iconUrl: chainsById[item.id]?.logoURI,
      })),
    [chainsById],
  );

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (next === "" || /^\d*\.?\d*$/.test(next)) {
      setAmount(next);
    }
  }

  function handleTokenSelect(symbol: string) {
    const next = mockTokens.find((item) => item.symbol === symbol);
    if (next) setToken(next);
  }

  function handleChainSelect(id: string) {
    const next = mockChains.find((item) => String(item.id) === id);
    if (next) setChain(next);
  }

  return (
    <section className="rounded-3xl border border-main bg-surface p-3 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="rounded-full bg-surface-muted px-4 py-2 text-sm font-semibold text-main">
          Supply
        </div>
        <Selector
          label="Select network"
          value={String(chain.id)}
          options={chainOptions}
          onSelect={handleChainSelect}
          variant="pill"
        />
      </div>

      <div className="relative mt-3">
        <div className="rounded-2xl bg-surface-raised p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">You supply</span>
            <span className="text-xs text-muted">on {chain.shortName}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-transparent text-[36px] font-medium leading-none tracking-tight text-main outline-none placeholder:text-faint"
            />
            <Selector
              label="Select token"
              value={token.symbol}
              options={tokenOptions}
              onSelect={handleTokenSelect}
              variant="pill"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">${formatUsd(usdValue)}</span>
            <span className="text-muted">Balance 0.00 {token.symbol}</span>
          </div>
        </div>

        <div className="relative mt-1 rounded-2xl bg-surface-raised p-4">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-[var(--color-surface-1)] bg-surface-muted">
              <FiArrowDown className="h-4 w-4 text-muted" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-muted">
              {activePeriod.title}
            </span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand whitespace-nowrap">
              {apyPercent.toFixed(2)}% APY
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 rounded-full bg-surface-muted p-1">
            {YIELD_PERIODS.map((period) => {
              const isActive = period.key === yieldPeriod;
              return (
                <button
                  key={period.key}
                  type="button"
                  onClick={() => setYieldPeriod(period.key)}
                  className={
                    isActive
                      ? "flex-1 rounded-full bg-surface-raised px-3 py-1.5 text-xs font-semibold text-main cursor-pointer transition-colors"
                      : "flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted cursor-pointer transition-colors hover:text-main"
                  }
                >
                  {period.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="flex-1 truncate text-[36px] font-medium leading-none tracking-tight text-main">
              ${formatUsd(estimatedForPeriod)}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-faint whitespace-nowrap">
              {activePeriod.suffix}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted">
              ~${formatUsd(hintValue)} / {activePeriod.hintLabel}
            </span>
            <span className="truncate text-muted">
              {selectedVault
                ? `via ${selectedVault.protocol}`
                : `Best route on ${chain.shortName}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
