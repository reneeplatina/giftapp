import type { LucideIcon } from "lucide-react";
import {
  Images,
  LayoutDashboard,
  ListChecks,
  PencilLine,
  Settings,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Themes and Preview deliberately aren't top-level nav destinations —
 * they're reached from the "Preview profile" / "Change theme" buttons at
 * the top of /profile/edit instead, since both only make sense in the
 * context of a profile you're already editing.
 */
export const APP_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile/edit", label: "Edit Profile", icon: PencilLine },
  { href: "/wishlist", label: "Wishlist", icon: ListChecks },
  { href: "/images", label: "My Images", icon: Images },
  { href: "/interview", label: "AI Gift Builder", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];
