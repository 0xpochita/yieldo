import { DepositSheet } from "./deposit-sheet";
import { ExpertBackground } from "./expert-background";
import { SupplyCard } from "./supply-card";
import { VaultList } from "./vault-list";

export function ExpertView() {
  return (
    <>
      <ExpertBackground />
      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
          <SupplyCard />
          <VaultList />
        </div>
      </main>
      <DepositSheet />
    </>
  );
}
