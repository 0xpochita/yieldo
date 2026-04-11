import { BackgroundDecor } from "@/components/layout";
import { Navbar1 } from "@/components/ui";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundDecor />
      <Navbar1 />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}
