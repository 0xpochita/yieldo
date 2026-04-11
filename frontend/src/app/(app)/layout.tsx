import { TopNav } from "@/components/layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-main">
      <TopNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
