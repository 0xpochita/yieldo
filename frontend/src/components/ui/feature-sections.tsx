import Image from "next/image";
import type { ReactNode } from "react";

export type FeatureChain = {
  name: string;
  logo?: string;
};

export type FeatureCard = {
  id: string;
  protocol: string;
  chains: FeatureChain[];
  extraChains?: number;
  aprRange: string;
  logo: string;
  tint: string;
};

type FeatureSectionsProps = {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  description?: ReactNode;
  cards: FeatureCard[];
  footer?: ReactNode;
};

export function FeatureSections({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  cards,
  footer,
}: FeatureSectionsProps) {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-3xl border border-main bg-surface p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="flex flex-col gap-2">
        {eyebrow ? (
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
            {eyebrowIcon}
            {eyebrow}
          </span>
        ) : null}
        <h2 className="max-w-[22ch] text-xl font-semibold leading-tight tracking-tight text-main sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-md text-sm text-muted">{description}</p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl p-3"
            style={{ backgroundColor: card.tint }}
          >
            <div className="flex items-center gap-3">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={card.logo}
                  alt={card.protocol}
                  fill
                  sizes="44px"
                  className="object-cover"
                  unoptimized
                />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-main">
                  {card.protocol}
                </span>
                <span className="flex items-center gap-1 truncate text-[11px] text-muted">
                  {card.chains.map((chain, index) => (
                    <span
                      key={chain.name}
                      className="flex items-center gap-1"
                    >
                      {index > 0 ? (
                        <span className="text-faint">·</span>
                      ) : null}
                      {chain.logo ? (
                        <Image
                          src={chain.logo}
                          alt={chain.name}
                          width={12}
                          height={12}
                          className="h-3 w-3 shrink-0 object-contain"
                          unoptimized
                        />
                      ) : null}
                      <span>{chain.name}</span>
                    </span>
                  ))}
                  {card.extraChains && card.extraChains > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="text-faint">·</span>
                      <span className="text-faint">+{card.extraChains}</span>
                    </span>
                  ) : null}
                </span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-baseline gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-main">
                {card.aprRange}
                <span className="text-[9px] font-bold uppercase tracking-wide text-faint">
                  APR
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
