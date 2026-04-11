"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SelectorOption = {
  key: string;
  label: string;
  hint?: string;
};

type SelectorProps = {
  label: string;
  value: string;
  options: SelectorOption[];
  onSelect: (key: string) => void;
  variant?: "chip" | "pill";
};

export function Selector({
  label,
  value,
  options,
  onSelect,
  variant = "pill",
}: SelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const active = options.find((item) => item.key === value) ?? options[0];

  const triggerClass =
    variant === "chip"
      ? "flex items-center gap-2 rounded-full bg-surface-muted border border-main px-3 py-1.5 text-sm font-semibold text-main cursor-pointer transition-all duration-200 ease-in-out hover:border-strong"
      : "flex items-center gap-2 rounded-full bg-surface-raised border border-main px-3 py-2 text-sm font-semibold text-main cursor-pointer transition-all duration-200 ease-in-out hover:border-strong";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClass}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
          {active.label.charAt(0)}
        </span>
        <span className="tracking-tight">{active.label}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-main bg-surface-raised shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <ul className="divide-y divide-[var(--color-line)]">
            {options.map((option) => {
              const isActive = option.key === active.key;
              return (
                <li key={option.key}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(option.key);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer transition-all duration-200 ease-in-out hover:bg-surface-muted"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                        {option.label.charAt(0)}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-main">
                          {option.label}
                        </span>
                        {option.hint ? (
                          <span className="text-xs text-muted">{option.hint}</span>
                        ) : null}
                      </span>
                    </span>
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
