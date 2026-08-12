import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

describe("AccordionItem", () => {
  it("renders collapsed by default", () => {
    const html = renderToStaticMarkup(
      <AccordionItem title="Low range">
        <p>an item</p>
      </AccordionItem>,
    );
    expect(html).not.toContain("open=\"\"");
  });

  it("renders open when defaultOpen is set", () => {
    const html = renderToStaticMarkup(
      <AccordionItem title="Low range" defaultOpen>
        <p>an item</p>
      </AccordionItem>,
    );
    expect(html).toContain("open=\"\"");
  });

  // The wishlist page shows the tier symbol and item count inside the
  // header, so the title has to accept elements and not just a string.
  it("accepts a rich title", () => {
    const html = renderToStaticMarkup(
      <Accordion>
        <AccordionItem
          title={
            <span>
              <span>$</span>Low range<span>(3)</span>
            </span>
          }
        >
          <p>an item</p>
        </AccordionItem>
      </Accordion>,
    );
    expect(html).toContain("$");
    expect(html).toContain("Low range");
    expect(html).toContain("(3)");
  });
});
