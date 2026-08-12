import { ExternalLink } from "lucide-react";

const LINK_CLASSES =
  "inline-flex items-center gap-1 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900";

/**
 * Search links for the item name on general marketplaces — never a
 * specific product/listing URL, since we can't know which exact result
 * (if any) is the right one, and docs/PRODUCT_SPEC.md forbids
 * fabricating links to specific products. Amazon stays the default,
 * with Google Shopping alongside it since plenty of items (brand-name
 * shoes, etc.) aren't sold on Amazon at all but do turn up there.
 */
export function ProductSearchLinks({ itemName }: { itemName: string }) {
  const query = encodeURIComponent(itemName);

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <a
        href={`https://www.amazon.com/s?k=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASSES}
      >
        Amazon
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
      <span aria-hidden="true" className="text-xs text-neutral-300">
        ·
      </span>
      <a
        href={`https://www.google.com/search?tbm=shop&q=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASSES}
      >
        Google Shopping
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
  );
}
