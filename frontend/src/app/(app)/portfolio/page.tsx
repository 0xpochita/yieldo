import type { Metadata } from "next";
import { PortfolioView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "Yieldo | Portfolio",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
