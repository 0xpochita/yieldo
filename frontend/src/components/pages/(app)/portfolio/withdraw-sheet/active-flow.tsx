"use client";

import {
  FiArrowDown,
  FiLoader,
} from "react-icons/fi";
import Image from "next/image";
import { useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useChainId,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { resolveProtocol } from "@/lib/protocol-registry";
import { useMetaStore, useWithdrawStore } from "@/stores";
import {
  ConnectPrompt,
  ErrorState,
  QuotingState,
  SuccessState,
} from "./withdraw-sheet-states";
import {
  formatBalance,
  formatDuration,
  formatUsd,
  PERCENTAGE_OPTIONS,
} from "./withdraw-sheet-utils";
import { useAccount } from "wagmi";

export function ConnectionGate() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return <ConnectPrompt />;
  }

  return <ActiveFlow walletAddress={address} />;
}

function ActiveFlow({ walletAddress }: { walletAddress: `0x${string}` }) {
  const position = useWithdrawStore((state) => state.position)!;
  const percentage = useWithdrawStore((state) => state.percentage);
  const quote = useWithdrawStore((state) => state.quote);
  const step = useWithdrawStore((state) => state.step);
  const error = useWithdrawStore((state) => state.error);
  const txHash = useWithdrawStore((state) => state.txHash);
  const setPercentage = useWithdrawStore((state) => state.setPercentage);
  const fetchQuote = useWithdrawStore((state) => state.fetchQuote);
  const setStep = useWithdrawStore((state) => state.setStep);
  const setError = useWithdrawStore((state) => state.setError);
  const setTxHash = useWithdrawStore((state) => state.setTxHash);
  const closeSheet = useWithdrawStore((state) => state.closeSheet);

  const chainsById = useMetaStore((state) => state.chainsById);

  const currentWalletChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  useEffect(() => {
    if (step === "idle" && !quote) {
      fetchQuote(walletAddress);
    }
  }, [step, quote, fetchQuote, walletAddress]);

  const resolved = resolveProtocol(position.protocolName);
  const chain = chainsById[position.chainId];
  const usdValue = Number.parseFloat(position.balanceUsd ?? "0");
  const withdrawUsd = Number.isFinite(usdValue)
    ? (usdValue * percentage) / 100
    : 0;
  const withdrawNative = (() => {
    try {
      const raw = position.balanceNative || "0";
      const balanceBn = raw.includes(".")
        ? parseUnits(raw, position.asset.decimals)
        : BigInt(raw);
      const withdrawn = (balanceBn * BigInt(percentage)) / 100n;
      return formatBalance(
        withdrawn.toString(),
        position.asset.decimals,
        position.asset.symbol,
      );
    } catch {
      return `— ${position.asset.symbol}`;
    }
  })();

  async function handleConfirm() {
    if (!quote) return;
    setError(null);

    try {
      if (currentWalletChainId !== position.chainId) {
        setStep("withdrawing");
        try {
          await switchChainAsync({ chainId: position.chainId });
        } catch {
          setError(
            `Please switch your wallet to ${chain?.name ?? `chain ${position.chainId}`} to continue.`,
          );
          setStep("ready");
          return;
        }
      }

      setStep("withdrawing");
      const hash = await sendTransactionAsync({
        to: quote.transactionRequest.to as `0x${string}`,
        data: quote.transactionRequest.data as `0x${string}`,
        value: quote.transactionRequest.value
          ? BigInt(quote.transactionRequest.value)
          : undefined,
        chainId: position.chainId,
      });
      setTxHash(hash);
      setStep("success");
    } catch (err) {
      const raw = (err as Error).message || "Transaction failed";
      if (raw.includes("User rejected") || raw.includes("user rejected")) {
        setError("Transaction was rejected in your wallet.");
      } else {
        const firstLine = raw.split("\n")[0];
        setError(
          firstLine.length > 200 ? `${firstLine.slice(0, 200)}…` : firstLine,
        );
      }
      setStep("ready");
    }
  }

  if (step === "quoting") {
    return (
      <QuotingState
        symbol={position.asset.symbol}
        protocolName={resolved.displayName}
      />
    );
  }

  if (step === "error" && !quote) {
    return (
      <ErrorState
        error={error}
        onRetry={() => fetchQuote(walletAddress)}
        onClose={closeSheet}
      />
    );
  }

  if (step === "success") {
    return <SuccessState txHash={txHash} onClose={closeSheet} />;
  }

  if (!quote) return null;

  const isWorking = step === "withdrawing";
  const toAmountDecimals = quote.action.toToken?.decimals ?? 18;
  const toAmountDisplay = quote.estimate.toAmount
    ? formatUnits(BigInt(quote.estimate.toAmount), toAmountDecimals)
    : "—";
  const toAmountMinDisplay = quote.estimate.toAmountMin
    ? formatUnits(BigInt(quote.estimate.toAmountMin), toAmountDecimals)
    : "—";
  const gasUsd = quote.estimate.gasCosts?.[0]?.amountUSD;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-surface-raised p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Position</span>
          <span className="flex items-center gap-1">
            {chain?.logoURI ? (
              <Image
                src={chain.logoURI}
                alt={chain.name}
                width={12}
                height={12}
                className="h-3 w-3 rounded-full"
                unoptimized
              />
            ) : null}
            {chain?.name ?? `Chain ${position.chainId}`}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          {resolved.logoPath ? (
            <Image
              src={resolved.logoPath}
              alt={resolved.displayName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
              {resolved.displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-main">
              {resolved.displayName}
            </span>
            <span className="truncate text-[11px] text-muted">
              {formatBalance(
                position.balanceNative,
                position.asset.decimals,
                position.asset.symbol,
              )}
              {" · "}
              {formatUsd(position.balanceUsd)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-raised p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Amount to withdraw</span>
          <span className="font-semibold text-brand">{percentage}%</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {PERCENTAGE_OPTIONS.map((value) => {
            const isActive = value === percentage;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPercentage(value)}
                className={
                  isActive
                    ? "rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                    : "rounded-xl border border-main px-3 py-2 text-xs font-medium text-muted transition-colors cursor-pointer hover:border-strong hover:text-main"
                }
              >
                {value === 100 ? "MAX" : `${value}%`}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-main font-semibold">{withdrawNative}</span>
          <span className="text-muted">~{formatUsd(withdrawUsd)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-main bg-surface-muted">
          <FiArrowDown className="h-3.5 w-3.5 text-muted" />
        </div>
      </div>

      <div className="rounded-2xl bg-surface-raised p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>You receive</span>
          <span>{quote.action.toToken?.symbol}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-main">
            {toAmountDisplay.length > 10
              ? `${toAmountDisplay.slice(0, 10)}…`
              : toAmountDisplay}
          </span>
          <span className="text-xs text-muted">
            {formatUsd(quote.estimate.toAmountUSD)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-raised px-4 py-3">
        <Row
          label="Minimum received"
          value={`${toAmountMinDisplay.length > 10 ? `${toAmountMinDisplay.slice(0, 10)}…` : toAmountMinDisplay} ${quote.action.toToken?.symbol ?? ""}`}
        />
        <Row label="Network fee" value={formatUsd(gasUsd)} />
        <Row
          label="Est. time"
          value={formatDuration(quote.estimate.executionDuration)}
        />
        <Row label="Slippage" value="0.5%" />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-surface-raised/60 px-3 py-2 text-[11px] text-muted">
        <Image
          src="/Assets/Images/Logo-Brand/yieldo-transparent.png"
          alt="Yieldo"
          width={16}
          height={16}
          className="h-4 w-4 object-contain"
        />
        Non-custodial. Your wallet signs the withdrawal directly.
      </div>

      {error ? (
        <div className="rounded-xl border border-[rgba(250,43,57,0.35)] bg-[rgba(250,43,57,0.12)] px-3 py-2 text-[11px] text-(--color-negative)">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={isWorking}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white transition-all duration-200 ease-in-out cursor-pointer hover-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isWorking ? (
          <>
            <FiLoader className="h-4 w-4 animate-spin" />
            Confirm in your wallet
          </>
        ) : (
          "Confirm withdrawal"
        )}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-faint">
        <span className="inline-flex items-center gap-1">
          Routed via
          <Image
            src="/Assets/Images/Logo-Brand/logo_lifi_light.svg"
            alt="LI.FI"
            width={10}
            height={10}
            className="h-2.5 w-2.5 opacity-80 invert"
          />
          <span className="font-semibold text-muted">LI.FI Composer</span>
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          exits
          {resolved.logoPath ? (
            <Image
              src={resolved.logoPath}
              alt={resolved.displayName}
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-contain"
            />
          ) : null}
          <span className="font-semibold text-muted">
            {resolved.displayName}
          </span>
          on
          {chain?.logoURI ? (
            <Image
              src={chain.logoURI}
              alt={chain.name}
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-contain"
              unoptimized
            />
          ) : null}
          <span className="font-semibold text-muted">
            {chain?.name ?? `chain ${position.chainId}`}
          </span>
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-main">{value}</span>
    </div>
  );
}
