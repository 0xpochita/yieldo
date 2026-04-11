"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, Wallet, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Earn", href: "/expert" },
  { label: "Portfolio", href: "/portfolio" },
];

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="relative z-10 flex w-full max-w-3xl items-center justify-between rounded-full border border-white/15 bg-white/10 px-6 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02)_55%,rgba(255,255,255,0.06))] before:content-['']">
        <div className="flex items-center">
          <Link href="/expert" className="flex items-center gap-2 cursor-pointer">
            <motion.div
              className="relative h-9 w-9"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/Assets/Images/Logo-Brand/yieldo-transparent.png"
                alt="Yieldo"
                fill
                priority
                sizes="36px"
                className="object-contain"
              />
            </motion.div>
            <span className="hidden text-base font-semibold tracking-tight text-white sm:inline">
              Yieldo
            </span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-8 md:flex">
          {NAV_LINKS.map((item) => {
            const isActive = pathname?.startsWith(item.href) ?? false;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={item.href}
                  className={
                    isActive
                      ? "relative z-10 text-sm font-semibold text-white transition-colors cursor-pointer"
                      : "relative z-10 text-sm font-medium text-white/60 transition-colors hover:text-white cursor-pointer"
                  }
                >
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <button
            type="button"
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(30,64,175,0.45)] transition-colors cursor-pointer hover-brand"
          >
            <Wallet className="h-4 w-4" />
            Connect wallet
          </button>
        </motion.div>

        <motion.button
          type="button"
          aria-label="Toggle menu"
          className="relative z-10 flex items-center md:hidden cursor-pointer"
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-6 w-6 text-white" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(13,14,15,0.75)] px-6 pt-24 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute right-6 top-6 p-2 cursor-pointer"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {NAV_LINKS.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link
                    href={item.href}
                    className="text-base font-medium text-white cursor-pointer"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-base font-semibold text-white transition-colors cursor-pointer hover-brand"
                  onClick={toggleMenu}
                >
                  <Wallet className="h-5 w-5" />
                  Connect wallet
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export { Navbar1 };
