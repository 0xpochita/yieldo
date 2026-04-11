import { DepositSheet } from "./deposit-sheet";
import { ExpertBackground } from "./expert-background";
import { SupplyCard } from "./supply-card";
import { VaultList } from "./vault-list";

export function ExpertView() {
  return (
    <>
      <ExpertBackground />
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-4 px-4 py-10 sm:py-16">
        <SupplyCard />
        <VaultList />
      </main>
      <DepositSheet />
    </>
  );
}
