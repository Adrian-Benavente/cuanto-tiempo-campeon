const {
  FALLBACK_RECENT_2022,
  getFallbackRecentMatches,
  selectRecentMatches,
} = require("../../api/_lib/recent-matches");

describe("selectRecentMatches", () => {
  it("filters matches without scores and sorts by date descending", () => {
    const matches = [
      {
        id: "old",
        homeTeam: "A",
        awayTeam: "B",
        homeScore: 1,
        awayScore: 0,
        date: "2022-12-01T12:00:00.000Z",
      },
      {
        id: "no-score",
        homeTeam: "C",
        awayTeam: "D",
        date: "2022-12-20T12:00:00.000Z",
      },
      {
        id: "new",
        homeTeam: "E",
        awayTeam: "F",
        homeScore: 2,
        awayScore: 1,
        date: "2022-12-18T18:00:00.000Z",
      },
      {
        id: "nested-score",
        homeTeam: "G",
        awayTeam: "H",
        score: { home: 3, away: 2 },
        date: "2022-12-10T18:00:00.000Z",
      },
    ];

    const result = selectRecentMatches(matches, 3);

    expect(result.map((match) => match.id)).toEqual(["new", "nested-score", "old"]);
  });

  it("limits the number of returned matches", () => {
    const matches = Array.from({ length: 8 }, (_, index) => ({
      id: `match-${index}`,
      homeScore: 1,
      awayScore: 0,
      date: `2022-12-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
    }));

    expect(selectRecentMatches(matches, 5)).toHaveLength(5);
  });
});

describe("getFallbackRecentMatches", () => {
  it("returns recent mode with static 2022 results", () => {
    const payload = getFallbackRecentMatches(2022);

    expect(payload).toEqual({
      mode: "recent",
      year: 2022,
      matches: FALLBACK_RECENT_2022,
      source: "fallback",
    });
    expect(payload.matches).toHaveLength(5);
    expect(payload.matches[0].stage).toBe("Final");
  });
});
