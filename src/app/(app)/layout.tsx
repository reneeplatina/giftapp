import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-topbar";
import { ProfileProvider } from "@/context/profile-context";
import { buildEmptyProfile, getFullProfileForEditing } from "@/lib/profile/dal";

// Auth is intentionally NOT checked here. Next.js error.tsx boundaries
// don't catch errors thrown by a layout in the same segment (only by
// its page and below), and per Next's own guidance, layouts don't
// re-render on every client-side navigation anyway — so each protected
// page calls requireAuthUser() itself. proxy.ts also redirects
// unauthenticated requests before they ever reach here, and Postgres
// RLS is the ultimate backstop regardless of either.
//
// The real profile data is still fetched here (rather than in each
// page) so ProfileProvider — and every section component under
// useProfile() — has one shared, already-loaded copy that persists
// across client-side navigation between /profile/edit, /themes, and
// /preview. If there's no session yet, buildEmptyProfile() fills in a
// harmless placeholder while the page-level requireAuthUser() redirect
// is in flight.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loaded = await getFullProfileForEditing();

  return (
    <ProfileProvider
      initialProfile={loaded?.profile ?? buildEmptyProfile()}
      initialTheme={loaded?.theme ?? "general"}
    >
      <div className="flex flex-1 flex-col md:flex-row">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppTopBar />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>
        <AppBottomNav />
      </div>
    </ProfileProvider>
  );
}
