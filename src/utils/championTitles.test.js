const {
  extractAggregatesPayload,
  mergeAggregatesWithFallback,
  normalizeAggregate,
} = require("../../api/_lib/champion-titles");

describe("champion-titles API helpers", () => {
  it("extracts aggregates from Zafronix data payloads", () => {
    expect(
      extractAggregatesPayload({
        data: [{ country: "Brazil", titles: 5 }],
      })
    ).toEqual([{ country: "Brazil", titles: 5 }]);
  });

  it("normalizes known API country names", () => {
    expect(normalizeAggregate({ country: "France", titles: 2 })).toEqual({
      slug: "francia",
      displayName: "Francia",
      countryCode: "FR",
      titles: 2,
    });
  });

  it("merges API results with fallback title counts", () => {
    const merged = mergeAggregatesWithFallback([
      { slug: "francia", displayName: "Francia", countryCode: "FR", titles: 2 },
    ]);

    expect(merged.find((entry) => entry.slug === "brasil")?.titles).toBe(5);
    expect(merged.find((entry) => entry.slug === "francia")?.titles).toBe(2);
  });
});
