const {
  deriveScoresFromGoals,
  enrichMatchScores,
  resolveMatchScores,
} = require("../../api/_lib/match-scores");

const PRODUCTION_NOW = new Date("2026-06-14T18:30:00.000Z");

describe("resolveMatchScores", () => {
  it("keeps explicit scores including zero", () => {
    expect(
      resolveMatchScores({
        homeScore: 0,
        awayScore: 0,
      })
    ).toEqual({ homeScore: 0, awayScore: 0 });
  });

  it("parses result text when numeric scores are missing", () => {
    expect(
      resolveMatchScores({
        result: "2-1",
      })
    ).toEqual({ homeScore: 2, awayScore: 1 });
  });

  it("derives scores from goals array", () => {
    expect(
      resolveMatchScores({
        goals: [
          { minute: 12, team: "home", scorer: "Havertz" },
          { minute: 44, team: "away", scorer: "Locadia" },
          { minute: 67, team: "home", scorer: "Wirtz" },
        ],
      })
    ).toEqual({ homeScore: 2, awayScore: 1 });
  });

  it("defaults to 0-0 for in-progress matches without score data", () => {
    expect(
      resolveMatchScores(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
        },
        { inProgress: true }
      )
    ).toEqual({ homeScore: 0, awayScore: 0 });
  });

  it("returns null scores when not in progress and data is missing", () => {
    expect(
      resolveMatchScores({
        status: "scheduled",
        kickoffUtc: "2026-06-15T17:00:00.000Z",
      })
    ).toEqual({ homeScore: null, awayScore: null });
  });
});

describe("enrichMatchScores", () => {
  it("adds resolved scores to the match payload", () => {
    const enriched = enrichMatchScores(
      {
        id: "2026-010",
        status: "scheduled",
        result: null,
        kickoffUtc: "2026-06-14T17:00:00.000Z",
        goals: [{ minute: 23, team: "home", scorer: "Havertz" }],
      },
      PRODUCTION_NOW
    );

    expect(enriched.homeScore).toBe(1);
    expect(enriched.awayScore).toBe(0);
  });
});

describe("deriveScoresFromGoals", () => {
  it("returns null when there are no goals", () => {
    expect(deriveScoresFromGoals({ goals: [] })).toBeNull();
  });
});
