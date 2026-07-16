import Link from "next/link";
import { Container } from "@/components/container";

export default function HomePage() {
  return (
    <Container className="flex flex-1 flex-col justify-center gap-6 py-16 text-center sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        One profile. Better gifts. Less guessing.
      </h1>
      <p className="mx-auto max-w-md text-base text-neutral-600">
        Build a free gift profile with your sizes, favorites, and wishlist.
        Share one link with friends and family so they always know what to
        get you.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/signup"
          className="w-full rounded-md bg-neutral-900 px-5 py-2.5 font-medium text-white hover:bg-neutral-700 sm:w-auto"
        >
          Create your gift profile
        </Link>
        <Link
          href="/login"
          className="w-full rounded-md border border-neutral-300 px-5 py-2.5 font-medium text-neutral-900 hover:bg-neutral-50 sm:w-auto"
        >
          Log in
        </Link>
      </div>
      <p className="text-sm text-neutral-500">
        Completely free. No ads, no payments, no shopping cart.
      </p>
    </Container>
  );
}
