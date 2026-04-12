"use client";

import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import {
  FiAlertTriangle,
  FiArrowDown,
  FiCheck,
  FiExternalLink,
  FiLoader,
} from "react-icons/fi";
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import { formatUnits } from "viem";
import {
  useChainId,
  useConfig,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { useDepositStore, useMetaStore } from "@/stores";
import {
  ERC20_ABI,
  NATIVE_TOKEN_ADDRESSES,
  formatDuration,
  formatUsdString,
  trimAmountDisplay,
} from "./deposit-sheet-utils";
import { ConnectPrompt, Row, StepIndicator } from "./deposit-sheet-states";

export function ActiveFlow({ walletAddress }: { walletAddress: `0x${string}` }) {
  const vault = useDepositStore((state) => state.vault)!;
  const token = useDepositStore((state) => state.token)!;
  const chain = useDepositStore((state) => state.chain)!;
  const amount = useDepositStore((state) => state.amount);
  const quote = useDepositStore((state) => state.quote);
  const step = useDepositStore((state) => state.step);
  const error = useDepositStore((state) => state.error);
  const txHash = useDepositStore((state) => state.txHash);
  const fromTokenAddress = useDepositStore((state) => state.fromTokenAddress);
  const fetchQuote = useDepositStore((state) => state.fetchQuote);
  const setStep = useDepositStore((state) => state.setStep);
  const setError = useDepositStore((state) => state.setError);
  const setTxHash = useDepositStore((state) => state.setTxHash);
  const closeSheet = useDepositStore((state) => state.closeSheet);

  const chainsById = useMetaStore((state) => state.chainsById);
  const tokensBySymbol = useMetaStore((state) => state.tokensBySymbol);

  const wagmiConfig = useConfig();
  const currentWalletChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  useEffect(() => {
    if (!quote && step === "idle") {
      fetchQuote(walletAddress);
    }
  }, [quote, step, fetchQuote, walletAddress]);

  const isCrossChain = chain.id !== vault.chainId;
  const tokenLogo =
    tokensBySymbol[chain.id]?.[token.symbol.toUpperCase()]?.logoURI;
  const fromChainLogo = chainsById[chain.id]?.logoURI;
  const toChainLogo = chainsById[vault.chainId]?.logoURI;

  async function handleConfirm() {
    if (!quote || !fromTokenAddress) return;
    setError(null);

    try {
      if (currentWalletChainId !== chain.id) {
        setStep("approving");
        await switchChainAsync({ chainId: chain.id });
      }

      const lowerFromToken = fromTokenAddress.toLowerCase();
      const isNative = NATIVE_TOKEN_ADDRESSES.has(lowerFromToken);
      const approvalAddress = (quote.estimate.approvalAddress ??
        quote.transactionRequest.to) as `0x${string}`;

      if (!isNative && approvalAddress) {
        setStep("approving");
        const amountNeeded = BigInt(quote.action.fromAmount);
        const currentAllowance = (await readContract(wagmiConfig, {
          address: lowerFromToken as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress, approvalAddress],
          chainId: chain.id,
        })) as bigint;

        if (currentAllowance < amountNeeded) {
          const approveHash = await writeContract(wagmiConfig, {
            address: lowerFromToken as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [approvalAddress, amountNeeded],
            chainId: chain.id,
          });
          await waitForTransactionReceipt(wagmiConfig, {
            hash: approveHash,
            chainId: chain.id,
          });
        }
      }

      setStep("depositing");
      const hash = await sendTransactionAsync({
        to: quote.transactionRequest.to as `0x${string}`,
        data: quote.transactionRequest.data as `0x${string}`,
        value: quote.transactionRequest.value
          ? BigInt(quote.transactionRequest.value)
          : undefined,
        chainId: chain.id,
      });
      setTxHash(hash);
      setStep("success");
    } catch (err) {
      const raw = (err as Error).message || "Transaction failed";
      const firstLine = raw.split("\n")[0];
      const clean = firstLine.length > 200
        ? `${firstLine.slice(0, 200)}\u2026`
        : firstLine;
      setError(clean);
      setStep("error");
    }
  }

  if (step === "quoting") {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <FiLoader className="h-6 w-6 animate-spin text-brand" />
        <p className="text-sm font-semibold text-main">
          Finding the best route on LI.FI&hellip;
        </p>
        <p className="text-xs text-muted">
          {isCrossChain
            ? `Bridging ${token.symbol} from ${chain.shortName} to ${vault.chainShortName}`
            : `Optimising deposit on ${chain.shortName}`}
        </p>
      </div>
    );
  }

  if (step === "error" && !quote) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <FiAlertTriangle className="h-6 w-6 text-(--color-negative)" />
        <p className="text-sm font-semibold text-main">
          Couldn&apos;t fetch a route
        </p>
        <p className="mx-auto max-w-xs text-xs text-muted">{error}</p>
        <button
          type="button"
          onClick={() => fetchQuote(walletAddress)}
          className="mt-2 cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover-brand"
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 18 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft"
        >
          <FiCheck className="h-7 w-7 text-brand" />
        </motion.div>
        <div>
          <p className="text-base font-semibold text-main">Deposit submitted</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted">
            Your funds will be earning in {vault.protocol} shortly. You can
            track the transaction below.
          </p>
        </div>
        {txHash ? (
          <a
            href={`https://scan.li.fi/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand underline"
          >
            View on LI.FI Scan
            <FiExternalLink className="h-3 w-3" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={closeSheet}
          className="mt-2 cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover-brand"
        >
          Done
        </button>
      </div>
    );
  }

  if (!quote) return null;

  const isWorking = step === "approving" || step === "depositing";
  const toAmountDecimals = quote.action.toToken?.decimals ?? 18;
  const toAmount = quote.estimate.toAmount;
  const toAmountMin = quote.estimate.toAmountMin;
  const toAmountDisplay = toAmount
    ? trimAmountDisplay(formatUnits(BigInt(toAmount), toAmountDecimals))
    : "\u2014";
  const toAmountMinDisplay = toAmountMin
    ? trimAmountDisplay(formatUnits(BigInt(toAmountMin), toAmountDecimals))
    : "\u2014";
  const gasUsd = quote.estimate.gasCosts?.[0]?.amountUSD;
  const bridgeFeeUsd = quote.estimate.feeCosts?.reduce((sum, fee) => {
    const value = Number.parseFloat(fee.amountUSD ?? "0");
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  return (
    <div className="flex flex-col gap-3">
      <StepIndicator step={step} isCrossChain={isCrossChain} />

      <div className="relative">
        <div className="rounded-2xl bg-surface-raised p-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>You supply</span>
            <span className="flex items-center gap-1">
              {fromChainLogo ? (
                <Image
                  src={fromChainLogo}
                  alt={chain.shortName}
                  width={12}
                  height={12}
                  className="h-3 w-3 rounded-full"
                  unoptimized
                />
              ) : null}
              {chain.shortName}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {tokenLogo ? (
                <Image
                  src={tokenLogo}
                  alt={token.symbol}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full"
                  unoptimized
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
                  {token.symbol.charAt(0)}
                </span>
              )}
              <div className="flex flex-col">
                <span className="text-lg font-semibold leading-tight text-main">
                  {amount || "0"} {token.symbol}
                </span>
                <span className="text-[11px] text-muted">{token.name}</span>
              </div>
            </div>
            <span className="text-xs text-muted">
              {formatUsdString(quote.estimate.fromAmountUSD)}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border-4 border-(--color-surface-1) bg-surface-muted">
            <FiArrowDown className="h-4 w-4 text-muted" />
          </div>
        </div>

        <div className="mt-1 rounded-2xl bg-surface-raised p-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>You earn via</span>
            <span className="flex items-center gap-1">
              {toChainLogo ? (
                <Image
                  src={toChainLogo}
                  alt={vault.chainShortName}
                  width={12}
                  height={12}
                  className="h-3 w-3 rounded-full"
                  unoptimized
                />
              ) : null}
              {vault.chainShortName}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            {vault.protocolLogoUri ? (
              <Image
                src={vault.protocolLogoUri}
                alt={vault.protocol}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
                unoptimized
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                {vault.protocol.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-main">
                {vault.protocol}
              </span>
              <span className="truncate text-[11px] text-muted">
                {vault.vaultName}
              </span>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
              {vault.apy.toFixed(2)}% APY
            </span>
          </div>
        </div>
      </div>

      {isCrossChain ? (
        <div className="flex items-start gap-2 rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3">
          <HiOutlineArrowsRightLeft className="mt-0.5 h-4 w-4 text-brand" />
          <div>
            <p className="text-xs font-semibold text-brand">
              Cross-chain deposit
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              LI.FI will bridge your {token.symbol} from {chain.shortName} to{" "}
              {vault.chainShortName} and deposit it into {vault.protocol} in a
              single signed transaction.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-surface-raised px-4 py-3">
        <Row
          label="Estimated output"
          value={`${toAmountDisplay} ${quote.action.toToken?.symbol ?? ""}`}
          sub={formatUsdString(quote.estimate.toAmountUSD)}
        />
        <Row
          label="Minimum received"
          value={`${toAmountMinDisplay} ${quote.action.toToken?.symbol ?? ""}`}
        />
        <Row
          label="Network fee"
          value={formatUsdString(gasUsd)}
        />
        {bridgeFeeUsd && bridgeFeeUsd > 0 ? (
          <Row
            label="Route fee"
            value={formatUsdString(bridgeFeeUsd.toString())}
          />
        ) : null}
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
        Non-custodial. Yieldo never holds your funds — your wallet signs every
        step.
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
            {step === "approving"
              ? "Check your wallet to approve"
              : "Confirm in your wallet"}
          </>
        ) : (
          <>
            Confirm deposit
          </>
        )}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-faint">
        <span className="inline-flex items-center gap-1">
          Powered by
          <Image
            src="/Assets/Images/Logo-Brand/logo_lifi_light.svg"
            alt="LI.FI"
            width={10}
            height={10}
            className="h-2.5 w-2.5 opacity-80 invert"
          />
          <span className="font-semibold text-muted">LI.FI</span>
        </span>
        <span>&middot;</span>
        <span className="inline-flex items-center gap-1">
          Routes discovered from
          {vault.protocolLogoUri ? (
            <Image
              src={vault.protocolLogoUri}
              alt={vault.protocol}
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-contain"
              unoptimized
            />
          ) : null}
          <span className="font-semibold text-muted">{vault.protocol}</span>
          on
          {toChainLogo ? (
            <Image
              src={toChainLogo}
              alt={vault.chainShortName}
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-contain"
              unoptimized
            />
          ) : null}
          <span className="font-semibold text-muted">
            {vault.chainShortName}
          </span>
        </span>
      </div>
    </div>
  );
}
