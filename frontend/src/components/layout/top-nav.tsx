"use client";

import { Search, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Expert", href: "/expert" },
  { label: "Simple", href: "/simple" },
  { label: "Portfolio", href: "/portfolio" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-main bg-[rgba(13,14,15,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 px-4 sm:px-6">
        <Link href="/expert" className="flex items-center gap-2 cursor-pointer">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            Y
          </span>
          <span className="text-base font-semibold tracking-tight text-main">
            yieldo
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href) ?? false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "rounded-xl px-3 py-2 text-sm font-semibold text-main cursor-pointer transition-all duration-200 ease-in-out"
                    : "rounded-xl px-3 py-2 text-sm font-medium text-muted cursor-pointer transition-all duration-200 ease-in-out hover:text-main"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden flex-1 justify-center lg:flex">
          <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-2xl border border-main bg-surface px-4 text-sm text-muted">
            <Search className="h-4 w-4" />
            <span className="flex-1">Search tokens, vaults, protocols</span>
            <kbd className="rounded-md border border-main bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
              /
            </kbd>
          </div>
        </div>

        <button
          type="button"
          className="ml-auto flex h-10 items-center gap-2 rounded-2xl bg-brand-soft px-4 text-sm font-semibold text-brand cursor-pointer transition-all duration-200 ease-in-out hover:bg-[rgba(30,64,175,0.28)] lg:ml-0"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect wallet</span>
        </button>
      </div>
    </header>
  );
}
