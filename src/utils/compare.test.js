const {
  extractCompareRows,
  getCompareCacheControl,
  normalizeCompareRow,
  parseYearsParam,
} = require("../../api/_lib/fetch-compare");

describe("parseYearsParam", () => {
  it("parses and sorts distinct years", () => {
    expect(parseYearsParam("2022,1986")).toEqual({ years: [1986, 2022] });
  });

  it("rejects fewer than two years", () => {
    expect(parseYearsParam("2022").error).toMatch(/between 2 and 6/i);
  });
});

describe("getCompareCacheControl", () => {
  it("uses shorter cache when 2026 is included", () => {
    expect(getCompareCacheControl([2022, 2026])).toContain("s-maxage=300");
    expect(getCompareCacheControl([1986, 2022])).toContain("s-maxage=86400");
  });
});

describe("normalizeCompareRow", () => {
  it("normalizes snake_case Zafronix fields and team names", () => {
    const row = normalizeCompareRow({
      year: 2022,
      champion: "Argentina",
      runner_up: "France",
      third_place: "Croatia",
      total_goals: 172,
      goals_per_match: 2.69,
      attendance: 3404252,
      top_scorer: { name: "Kylian Mbappé", goals: 8 },
      best_player: "Lionel Messi",
    });

    expect(row).toEqual({
      year: 2022,
      champion: "Argentina",
      runnerUp: "Francia",
      thirdPlace: "Croatia",
      totalGoals: 172,
      goalsPerMatch: 2.69,
      attendance: 3404252,
      topScorer: "Kylian Mbappé (8)",
      bestPlayer: "Lionel Messi",
    });
  });
});

describe("extractCompareRows", () => {
  it("reads rows from data and keyed payloads", () => {
    expect(
      extractCompareRows({
        data: [{ year: 1986, champion: "Argentina" }],
      })
    ).toHaveLength(1);

    expect(
      extractCompareRows({
        1986: { champion: "Argentina" },
        2022: { champion: "Argentina" },
      })
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ year: 1986 }),
        expect.objectContaining({ year: 2022 }),
      ])
    );
  });
});
