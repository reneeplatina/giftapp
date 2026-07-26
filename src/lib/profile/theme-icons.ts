import {
  Baby,
  Cake,
  Flower2,
  Gem,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Sparkles,
  TreePine,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ThemeKey } from "@/types/profile";

export const THEME_ICONS: Record<ThemeKey, LucideIcon> = {
  general: Sparkles,
  birthday: Cake,
  christmas: TreePine,
  anniversary: HeartHandshake,
  graduation: GraduationCap,
  valentines: Heart,
  mothers_day: Flower2,
  fathers_day: Wrench,
  wedding: Gem,
  baby_shower: Baby,
  housewarming: Home,
};
