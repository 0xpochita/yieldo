"use client";

import { FiChevronDown } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { mockChains, mockTokens } from "@/data";
import { useExpertStore, useMetaStore } from "@/stores";
import { Selector } from "../selector";
import { type YieldPeriod, TOKEN_LOGO_FALLBACKS, YIELD_PERIODS } from "./constants";
import { formatUsd } from "./utils";

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
    <section className="rounded-3xl border border-main bg-surface p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-main">
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

      <div className="relative mt-2">
        <div className="rounded-2xl bg-surface-raised p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">You supply</span>
            <span className="text-[11px] text-muted">on {chain.shortName}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-transparent text-[28px] font-medium leading-none tracking-tight text-main outline-none placeholder:text-faint"
            />
            <Selector
              label="Select token"
              value={token.symbol}
              options={tokenOptions}
              onSelect={handleTokenSelect}
              variant="pill"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">${formatUsd(usdValue)}</span>
            <span className="text-muted">Balance 0.00 {token.symbol}</span>
          </div>
        </div>

        <div className="relative mt-1 rounded-2xl bg-surface-raised p-3">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-(--color-surface-1) bg-brand">
              <FiChevronDown className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">
              {activePeriod.title}
            </span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand whitespace-nowrap">
              {apyPercent.toFixed(2)}% APY
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 rounded-full bg-surface-muted p-1">
            {YIELD_PERIODS.map((period) => {
              const isActive = period.key === yieldPeriod;
              return (
                <button
                  key={period.key}
                  type="button"
                  onClick={() => setYieldPeriod(period.key)}
                  className={
                    isActive
                      ? "flex-1 rounded-full bg-surface-raised px-2.5 py-1 text-[11px] font-semibold text-main cursor-pointer transition-colors"
                      : "flex-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted cursor-pointer transition-colors hover:text-main"
                  }
                >
                  {period.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="flex-1 truncate text-[28px] font-medium leading-none tracking-tight text-main">
              ${formatUsd(estimatedForPeriod)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-faint whitespace-nowrap">
              {activePeriod.suffix}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
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
