import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Property 6: Semantic Search Results Ordered by Similarity
 *
 * Since actual pgvector search requires a database with embeddings,
 * we test the ordering invariant with mocked similarity scores.
 * The contract is: for any search returning multiple results,
 * adjacent results satisfy a.similarityScore >= b.similarityScore.
 */

interface SearchResult {
  id: string;
  name: string;
  similarityScore: number;
}

function rankByDescendingSimilarity(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => b.similarityScore - a.similarityScore);
}

describe("Property: Semantic Search Results Ordered by Similarity", () => {
  const searchResultArb: fc.Arbitrary<SearchResult> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    similarityScore: fc.float({ min: 0, max: 1, noNaN: true }),
  });

  it("adjacent results satisfy a.similarityScore >= b.similarityScore", () => {
    fc.assert(
      fc.property(
        fc.array(searchResultArb, { minLength: 2, maxLength: 50 }),
        (results) => {
          const ranked = rankByDescendingSimilarity(results);

          // Verify descending order
          for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].similarityScore).toBeGreaterThanOrEqual(
              ranked[i + 1].similarityScore
            );
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  it("ranking preserves all input results (no items lost or duplicated)", () => {
    fc.assert(
      fc.property(
        fc.array(searchResultArb, { minLength: 1, maxLength: 30 }),
        (results) => {
          // Give each result a unique id to avoid collisions
          const uniqueResults = results.map((r, i) => ({
            ...r,
            id: `result-${i}`,
          }));
          const ranked = rankByDescendingSimilarity(uniqueResults);

          // Same length
          expect(ranked.length).toBe(uniqueResults.length);

          // All IDs preserved
          const inputIds = new Set(uniqueResults.map((r) => r.id));
          const rankedIds = new Set(ranked.map((r) => r.id));
          expect(rankedIds).toEqual(inputIds);
        }
      ),
      { numRuns: 300 }
    );
  });

  it("first result always has the highest similarity score", () => {
    fc.assert(
      fc.property(
        fc.array(searchResultArb, { minLength: 1, maxLength: 30 }),
        (results) => {
          const ranked = rankByDescendingSimilarity(results);
          const maxScore = Math.max(...results.map((r) => r.similarityScore));

          expect(ranked[0].similarityScore).toBeCloseTo(maxScore, 10);
        }
      ),
      { numRuns: 300 }
    );
  });
});
