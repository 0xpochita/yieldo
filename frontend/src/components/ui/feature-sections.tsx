import Image from "next/image";
import type { ReactNode } from "react";

export type FeatureCard = {
  id: string;
  protocol: string;
  network: string;
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
    <section className="relative flex min-h-[560px] flex-col overflow-hidden rounded-3xl border border-main bg-surface p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="flex flex-col gap-2">
        {eyebrow ? (
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
            {eyebrowIcon}
            {eyebrow}
          </span>
        ) : null}
        <h2 className="max-w-[22ch] text-2xl font-semibold leading-tight tracking-tight text-main sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-md text-sm text-muted">{description}</p>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl p-4"
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
                <span className="truncate text-[11px] text-muted">
                  {card.network}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <span className="inline-flex items-baseline gap-1 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold text-main">
                {card.aprRange}
                <span className="text-[9px] font-bold uppercase tracking-wide text-faint">
                  APR
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-auto pt-6">{footer}</div> : null}
    </section>
  );
}
