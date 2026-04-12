export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  if (value < 0.01) return "< $0.01";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatBalance(
  raw: string,
  _decimals: number,
  symbol: string,
): string {
  try {
    const amount = Number.parseFloat(raw || "0");
    if (!Number.isFinite(amount) || amount === 0) return `0 ${symbol}`;
    if (amount < 0.0001) return `< 0.0001 ${symbol}`;
    if (amount >= 1_000)
      return `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${symbol}`;
    return `${amount.toFixed(4)} ${symbol}`;
  } catch {
    return `— ${symbol}`;
  }
}

export const SKELETON_ROWS = [0, 1, 2];
