import { getMaxTitles, getTitlesRatio } from "./championTitles";

describe("champion title metrics", () => {
  const champions = [
    { slug: "brasil" },
    { slug: "argentina" },
    { slug: "uruguay" },
  ];

  const aggregates = [
    { slug: "brasil", titles: 5 },
    { slug: "argentina", titles: 3 },
    { slug: "uruguay", titles: 2 },
  ];

  it("returns the highest title count among champions", () => {
    expect(getMaxTitles(champions, aggregates)).toBe(5);
  });

  it("normalizes title counts against the maximum", () => {
    expect(getTitlesRatio(5, 5)).toBe(1);
    expect(getTitlesRatio(3, 5)).toBe(0.6);
    expect(getTitlesRatio(0, 5)).toBe(0);
  });
});
