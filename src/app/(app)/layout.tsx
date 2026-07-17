import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <AppSidebar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <AppBottomNav />
    </div>
  );
}
