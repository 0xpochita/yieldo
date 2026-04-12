"use client";

import { FiCheck, FiChevronDown } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SelectorProps } from "./option-icon";
import { OptionIcon } from "./option-icon";

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
      ? "flex items-center gap-2 rounded-full bg-surface-muted border border-main px-3 py-1.5 text-sm font-semibold text-main cursor-pointer transition-colors duration-200 ease-in-out hover:border-strong"
      : "flex items-center gap-2 rounded-full bg-surface-raised border border-main px-3 py-2 text-sm font-semibold text-main cursor-pointer transition-colors duration-200 ease-in-out hover:border-strong";

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClass}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={active.key}
            initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className="flex"
          >
            <OptionIcon option={active} size={24} />
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`label-${active.key}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="tracking-tight"
          >
            {active.label}
          </motion.span>
        </AnimatePresence>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="flex"
        >
          <FiChevronDown className="h-4 w-4 text-muted" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute right-0 z-20 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-main bg-surface-raised"
            style={{ willChange: "transform, opacity" }}
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.02,
                  },
                },
              }}
              className="divide-y divide-(--color-line)"
            >
              {options.map((option) => {
                const isActive = option.key === active.key;
                return (
                  <motion.li
                    key={option.key}
                    variants={{
                      hidden: { opacity: 0, x: -8 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => {
                        onSelect(option.key);
                        setOpen(false);
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-surface-muted"
                    >
                      <span className="flex items-center gap-3">
                        <OptionIcon option={option} size={28} />
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-main">
                            {option.label}
                          </span>
                          {option.hint ? (
                            <span className="text-xs text-muted">
                              {option.hint}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      {isActive ? (
                        <motion.span
                          layoutId={`active-dot-${label}`}
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <FiCheck className="h-2.5 w-2.5" strokeWidth={3} />
                        </motion.span>
                      ) : null}
                    </motion.button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
