import { requireAuthUser } from "@/lib/auth/dal";
import { PreviewClient } from "./preview-client";

export default async function PreviewPage() {
  await requireAuthUser("/preview");

  return <PreviewClient />;
}
