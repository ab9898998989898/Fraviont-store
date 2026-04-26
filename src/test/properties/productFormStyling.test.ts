import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as fc from "fast-check";

/**
 * UI Styling Exploration Test - Task 1.5
 *
 * Validates: Requirements 1.7
 *
 * This test uses static source analysis to detect the bug where `bg-black`
 * is incorrectly placed inside the `value` attribute of category dropdown
 * options instead of in a `className` attribute.
 *
 * EXPECTED OUTCOME on unfixed code: FAILS
 *   - value attributes contain "bg-black" (e.g. value="perfumes bg-black")
 *   - className attributes are absent from option elements
 *
 * EXPECTED OUTCOME after fix: PASSES
 *   - value attributes are clean (e.g. value="perfumes")
 *   - className="bg-black" is present on each option element
 */

const PRODUCT_FORM_PATH = resolve(
  __dirname,
  "../../components/admin/ProductForm.tsx"
);

const CATEGORIES = ["perfumes", "cosmetics", "jewelry", "gift_sets"] as const;

describe("ProductForm - category dropdown styling (Bug 1.7)", () => {
  const source = readFileSync(PRODUCT_FORM_PATH, "utf-8");

  it("option value attributes should NOT contain bg-black", () => {
    // Matches patterns like value="perfumes bg-black" or value="cosmetics bg-black"
    const malformedValuePattern = /value="[^"]*bg-black[^"]*"/g;
    const matches = source.match(malformedValuePattern);

    // On unfixed code this assertion FAILS because matches will be non-null
    expect(
      matches,
      `Found bg-black inside value attributes: ${JSON.stringify(matches)}`
    ).toBeNull();
  });

  it("each category option should have className=\"bg-black\"", () => {
    // Extract all <option ...> blocks from the source
    const optionPattern = /<option\s[^>]*>/g;
    const optionTags = source.match(optionPattern) ?? [];

    // Filter to category-related options (those whose value is one of the known categories)
    const categoryOptionTags = optionTags.filter((tag) =>
      CATEGORIES.some((cat) => tag.includes(`value="${cat}`))
    );

    // On unfixed code this assertion FAILS because className is absent
    expect(
      categoryOptionTags.length,
      "Expected to find 4 category option tags"
    ).toBe(4);

    for (const tag of categoryOptionTags) {
      expect(
        tag,
        `Category option tag is missing className="bg-black": ${tag}`
      ).toContain('className="bg-black"');
    }
  });

  it("each category option value should be exactly the category slug (no extra tokens)", () => {
    // Property: for every known category slug, the value attribute equals exactly that slug
    for (const category of CATEGORIES) {
      // Match value="<category>" with optional trailing content before closing quote
      const exactValuePattern = new RegExp(`value="${category}"`, "g");
      const hasExactValue = exactValuePattern.test(source);

      // On unfixed code this FAILS because value is "perfumes bg-black" not "perfumes"
      expect(
        hasExactValue,
        `Expected value="${category}" but found value with extra tokens in source`
      ).toBe(true);
    }
  });

  it("property: no option element mixes styling tokens into its value attribute", () => {
    /**
     * Validates: Requirements 1.7
     *
     * Property-based check: for each category, the value attribute must be a
     * clean slug (no whitespace-separated extra tokens like CSS class names).
     */
    fc.assert(
      fc.property(
        fc.constantFrom(...CATEGORIES),
        (category) => {
          // A clean value attribute contains only the category slug
          const cleanValueRegex = new RegExp(`value="${category}"`, "g");
          // A malformed value attribute contains the category slug plus extra tokens
          const malformedValueRegex = new RegExp(
            `value="${category}\\s+[^"]+"`
          );

          const hasMalformed = malformedValueRegex.test(source);
          const hasClean = cleanValueRegex.test(source);

          // On unfixed code: hasMalformed=true, hasClean=false → property fails
          return !hasMalformed && hasClean;
        }
      )
    );
  });
});
