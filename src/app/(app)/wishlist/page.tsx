import { requireAuthUser } from "@/lib/auth/dal";
import { WishlistClient } from "./wishlist-client";

export default async function WishlistPage() {
  await requireAuthUser("/wishlist");

  return <WishlistClient />;
}
