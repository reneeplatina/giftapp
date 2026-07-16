import { Container } from "@/components/container";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Container className="flex flex-1 flex-col justify-center py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
        Coming soon
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
        Profile: {slug}
      </h1>
      <p className="mt-3 text-base text-neutral-600">
        Public gift profiles aren&apos;t built yet. Soon this page will show
        someone&apos;s gift profile, an AI assistant to help pick a gift, and
        a button to create your own profile.
      </p>
    </Container>
  );
}
