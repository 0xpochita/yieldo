import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import { type FeatureCard, FeatureSections } from "@/components/ui";

const CHAIN_LOGOS = {
  ethereum: "/Assets/Images/Logo-Coin/eth-logo.svg",
  arbitrum: "/Assets/Images/Logo-Coin/arb-logo.svg",
  base: "/Assets/Images/Logo-Coin/logo-base.webp",
} as const;

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "yo-protocol",
    protocol: "Yo Protocol",
    chains: [{ name: "Arbitrum", logo: CHAIN_LOGOS.arbitrum }],
    aprRange: "4.0 – 18.0",
    logo: "/Assets/Images/Logo-DeFi/yo-protocol-logo.png",
    tint: "rgba(190, 244, 50, 0.08)",
  },
  {
    id: "morpho",
    protocol: "Morpho",
    chains: [
      { name: "Ethereum", logo: CHAIN_LOGOS.ethereum },
      { name: "Base", logo: CHAIN_LOGOS.base },
    ],
    aprRange: "3.5 – 12.0",
    logo: "/Assets/Images/Logo-DeFi/morpho-logo.webp",
    tint: "rgba(59, 130, 246, 0.12)",
  },
  {
    id: "euler",
    protocol: "Euler Finance",
    chains: [{ name: "Ethereum", logo: CHAIN_LOGOS.ethereum }],
    aprRange: "2.0 – 8.5",
    logo: "/Assets/Images/Logo-DeFi/euler-finance-logo.svg",
    tint: "rgba(55, 190, 193, 0.10)",
  },
  {
    id: "aave",
    protocol: "Aave",
    chains: [{ name: "Ethereum", logo: CHAIN_LOGOS.ethereum }],
    extraChains: 6,
    aprRange: "2.5 – 7.0",
    logo: "/Assets/Images/Logo-DeFi/aave-logo.svg",
    tint: "rgba(147, 145, 247, 0.12)",
  },
];

export function IdleAggregatorCard() {
  return (
    <FeatureSections
      eyebrow="Yieldo Aggregator"
      eyebrowIcon={
        <Image
          src="/Assets/Images/Logo-Brand/yieldo-transparent.png"
          alt="Yieldo"
          width={18}
          height={18}
          className="h-4 w-4 object-contain"
        />
      }
      title="Best yield, aggregated live."
      description={
        <>
          Enter an amount to discover the top vault routes across 20+ DeFi
          protocols, streamed in real time from{" "}
          <span className="inline-flex items-baseline gap-1 align-baseline">
            <Image
              src="/Assets/Images/Logo-Brand/logo_lifi_light.svg"
              alt="LI.FI"
              width={10}
              height={10}
              className="inline-block translate-y-[1px] opacity-80 invert"
            />
            <span className="font-semibold text-main">LI.FI Earn</span>
          </span>
          .
        </>
      }
      cards={FEATURE_CARDS}
      footer={
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-4 py-2 text-sm font-semibold text-white">
            <FiArrowLeft className="h-4 w-4" />
            Enter an amount to continue
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-faint">
            <Image
              src="/Assets/Images/Logo-Brand/logo_lifi_light.svg"
              alt="LI.FI"
              width={12}
              height={12}
              className="h-3 w-3 opacity-80 invert"
            />
            Powered by LI.FI
          </div>
        </div>
      }
    />
  );
}
