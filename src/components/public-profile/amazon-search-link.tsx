import { ExternalLink } from "lucide-react";

/**
 * Links to real Amazon search results for the item name — never a
 * specific product/listing URL, since we can't know which exact result
 * (if any) is the right one, and docs/PRODUCT_SPEC.md forbids fabricating
 * links to specific products.
 */
export function AmazonSearchLink({ itemName }: { itemName: string }) {
  const href = `https://www.amazon.com/s?k=${encodeURIComponent(itemName)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
    >
      Search on Amazon
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}
