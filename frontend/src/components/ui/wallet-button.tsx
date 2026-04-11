"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, Wallet } from "lucide-react";
import { useWalletReady } from "@/lib/wallet-ready";

type WalletButtonProps = {
  variant?: "desktop" | "mobile";
};

const DESKTOP_CLASS =
  "relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(30,64,175,0.45)] transition-colors cursor-pointer hover-brand";

const MOBILE_CLASS =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-base font-semibold text-white transition-colors cursor-pointer hover-brand";

export function WalletButton({ variant = "desktop" }: WalletButtonProps) {
  const ready = useWalletReady();
  const base = variant === "mobile" ? MOBILE_CLASS : DESKTOP_CLASS;
  const iconSize = variant === "mobile" ? "h-5 w-5" : "h-4 w-4";

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        aria-busy="true"
        className={`${base} cursor-wait opacity-70`}
      >
        <Wallet className={iconSize} />
        Connect wallet
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const connectReady =
          mounted && authenticationStatus !== "loading";
        const connected =
          connectReady &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connectReady) {
          return (
            <button
              type="button"
              disabled
              aria-busy="true"
              className={`${base} cursor-wait opacity-70`}
            >
              <Wallet className={iconSize} />
              Connect wallet
            </button>
          );
        }

        if (!connected) {
          return (
            <button type="button" onClick={openConnectModal} className={base}>
              <Wallet className={iconSize} />
              Connect wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button type="button" onClick={openChainModal} className={base}>
              <AlertTriangle className={iconSize} />
              Wrong network
            </button>
          );
        }

        return (
          <button type="button" onClick={openAccountModal} className={base}>
            <Wallet className={iconSize} />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
