"use client";

import Image from "next/image";

export type SelectorOption = {
  key: string;
  label: string;
  hint?: string;
  iconUrl?: string;
};

export type SelectorProps = {
  label: string;
  value: string;
  options: SelectorOption[];
  onSelect: (key: string) => void;
  variant?: "chip" | "pill";
};

export function OptionIcon({
  option,
  size,
}: {
  option: SelectorOption;
  size: number;
}) {
  if (option.iconUrl) {
    return (
      <span
        className="relative overflow-hidden rounded-full bg-surface-muted"
        style={{ width: size, height: size }}
      >
        <Image
          src={option.iconUrl}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-contain"
          unoptimized
        />
      </span>
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {option.label.charAt(0)}
    </span>
  );
}
