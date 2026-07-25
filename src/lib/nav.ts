import type { LucideIcon } from "lucide-react";
import { Eye, LayoutDashboard, ListChecks, Palette, PencilLine, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile/edit", label: "Edit Profile", icon: PencilLine },
  { href: "/wishlist", label: "Wishlist", icon: ListChecks },
  { href: "/themes", label: "Themes", icon: Palette },
  { href: "/preview", label: "Preview", icon: Eye },
  { href: "/settings", label: "Settings", icon: Settings },
];
