"use client";

import { ArrowDown, Settings } from "lucide-react";
import { useMemo } from "react";
import { mockChains, mockTokens } from "@/data";
import { useExpertStore } from "@/stores";
import { Selector } from "./selector";

const YEARLY_APY_ESTIMATE = 0.0842;
const TABS = ["Supply", "Withdraw", "Zap"] as const;

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
  const setToken = useExpertStore((state) => state.setToken);
  const setChain = useExpertStore((state) => state.setChain);
  const setAmount = useExpertStore((state) => state.setAmount);

  const amountNumber = Number.parseFloat(amount || "0");
  const usdValue = Number.isFinite(amountNumber)
    ? amountNumber * token.usdPrice
    : 0;
  const estimatedYearly = usdValue * YEARLY_APY_ESTIMATE;

  const tokenOptions = useMemo(
    () =>
      mockTokens.map((item) => ({
        key: item.symbol,
        label: item.symbol,
        hint: item.name,
      })),
    [],
  );

  const chainOptions = useMemo(
    () =>
      mockChains.map((item) => ({
        key: String(item.id),
        label: item.shortName,
        hint: item.name,
      })),
    [],
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
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = tab === "Supply";
            return (
              <button
                key={tab}
                type="button"
                className={
                  isActive
                    ? "rounded-full bg-surface-muted px-4 py-2 text-sm font-semibold text-main cursor-pointer transition-all duration-200 ease-in-out"
                    : "rounded-full px-4 py-2 text-sm font-medium text-muted cursor-pointer transition-all duration-200 ease-in-out hover:text-main"
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted cursor-pointer transition-all duration-200 ease-in-out hover:bg-surface-muted hover:text-main"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mt-3">
        <div className="rounded-2xl bg-surface-raised p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Supply</span>
            <Selector
              label="Select network"
              value={String(chain.id)}
              options={chainOptions}
              onSelect={handleChainSelect}
              variant="chip"
            />
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
            <span className="text-muted">
              Balance 0.00 {token.symbol}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-[var(--color-surface-1)] bg-surface-muted">
            <ArrowDown className="h-4 w-4 text-muted" />
          </div>
        </div>

        <div className="mt-1 rounded-2xl bg-surface-raised p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">
              Estimated yearly yield
            </span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
              {(YEARLY_APY_ESTIMATE * 100).toFixed(2)}% APY
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <input
              type="text"
              readOnly
              disabled
              value={formatUsd(estimatedYearly)}
              className="w-full cursor-not-allowed bg-transparent text-[36px] font-medium leading-none tracking-tight text-main outline-none"
            />
            <div className="flex items-center gap-2 rounded-full border border-main bg-surface-muted px-3 py-2 text-sm font-semibold text-muted">
              USD / yr
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">
              ~${formatUsd(estimatedYearly / 12)} / month
            </span>
            <span className="text-muted">Best route on {chain.shortName}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
