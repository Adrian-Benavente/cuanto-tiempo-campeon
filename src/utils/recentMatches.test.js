const {
  FALLBACK_RECENT_2022,
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  getFallbackRecentMatches,
  getRecentTournamentYears,
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

  it("accepts scores provided only in result text", () => {
    const matches = [
      {
        id: "result-only",
        homeTeam: "Argentina",
        awayTeam: "Francia",
        result: "2-1",
        date: "2026-06-14T18:00:00.000Z",
      },
      {
        id: "unplayed",
        homeTeam: "Brasil",
        awayTeam: "Alemania",
        date: "2026-06-15T18:00:00.000Z",
      },
    ];

    expect(selectRecentMatches(matches, 5).map((match) => match.id)).toEqual([
      "result-only",
    ]);
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

describe("current tournament helpers", () => {
  it("returns 2026 as current world cup year from 2026 onward", () => {
    expect(getCurrentWorldCupYear(new Date("2026-06-14T12:00:00.000Z"))).toBe(2026);
    expect(getCurrentWorldCupYear(new Date("2025-12-01T12:00:00.000Z"))).toBeNull();
  });

  it("only considers the current tournament year for recent fallback", () => {
    expect(getRecentTournamentYears(new Date("2026-06-14T12:00:00.000Z"))).toEqual([
      2026,
    ]);
    expect(getRecentTournamentYears(new Date("2024-06-14T12:00:00.000Z"))).toEqual([]);
  });

  it("returns an idle payload when there is nothing to show", () => {
    expect(getEmptyLivePayload(new Date("2024-06-14T12:00:00.000Z"), "fallback")).toEqual({
      mode: "idle",
      year: 2024,
      matches: [],
      source: "fallback",
    });
  });
});
