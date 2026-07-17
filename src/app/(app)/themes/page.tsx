import { requireAuthUser } from "@/lib/auth/dal";
import { ThemesClient } from "./themes-client";

export default async function ThemesPage() {
  await requireAuthUser("/themes");

  return <ThemesClient />;
}
