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

  it("extracts aggregates from a Zafronix byCountry object", () => {
    expect(
      extractAggregatesPayload({
        byCountry: {
          Spain: 2,
          Argentina: 3,
        },
      })
    ).toEqual([
      { country: "Spain", titles: 2 },
      { country: "Argentina", titles: 3 },
    ]);
  });

  it("merges Spain's second title from the API over the fallback", () => {
    const extracted = extractAggregatesPayload({
      byCountry: {
        Spain: 2,
        "West Germany": 3,
        Germany: 1,
      },
    });
    const merged = mergeAggregatesWithFallback(
      extracted.map(normalizeAggregate).filter(Boolean)
    );

    expect(merged.find((entry) => entry.slug === "españa")?.titles).toBe(2);
    expect(merged.find((entry) => entry.slug === "alemania")?.titles).toBe(4);
  });
});
