"use client";

import { FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";
import { useWalletReady } from "@/lib/wallet-ready";
import { useWithdrawStore } from "@/stores";
import { LoadingState } from "./withdraw-sheet-states";
import { ConnectionGate } from "./active-flow";

export function WithdrawSheet() {
  const open = useWithdrawStore((state) => state.open);
  const closeSheet = useWithdrawStore((state) => state.closeSheet);
  const ready = useWalletReady();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeSheet}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-t-3xl border border-main bg-surface sm:rounded-3xl"
          >
            {ready ? <WithdrawBody /> : <LoadingState />}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function WithdrawBody() {
  const closeSheet = useWithdrawStore((state) => state.closeSheet);
  const position = useWithdrawStore((state) => state.position);

  if (!position) return null;

  return (
    <div className="flex flex-col">
      <SheetHeader onClose={closeSheet} />
      <div className="px-5 pb-5 pt-4">
        <ConnectionGate />
      </div>
    </div>
  );
}

function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-main px-5 py-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          Withdraw
        </div>
        <h3 className="text-base font-semibold text-main">
          Pull funds out of your vault
        </h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-raised text-muted transition-colors hover:bg-surface-muted hover:text-main"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}
