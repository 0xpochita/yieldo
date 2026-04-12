import type { Metadata } from "next";
import { ExpertView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "Yieldo | Earn",
};

export default function ExpertPage() {
  return <ExpertView />;
}
