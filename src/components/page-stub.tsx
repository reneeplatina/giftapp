import { Container } from "@/components/container";

/**
 * Placeholder used by routes that are planned but not yet built.
 * Intentionally has no interactive controls, so nothing here can look
 * functional before it is.
 */
export function PageStub({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Container className="flex flex-1 flex-col justify-center py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
        Coming soon
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
        {title}
      </h1>
      <p className="mt-3 text-base text-neutral-600">{description}</p>
    </Container>
  );
}
