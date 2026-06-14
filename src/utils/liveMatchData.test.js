import {
  getMatchScores,
  isMatchInProgress,
} from "./liveMatchData";

describe("liveMatchData", () => {
  const now = new Date("2026-06-14T18:30:00.000Z");

  test("detects in-progress matches by kickoff", () => {
    expect(
      isMatchInProgress(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
        },
        now
      )
    ).toBe(true);
  });

  test("does not assign a default score to in-progress matches", () => {
    expect(
      getMatchScores({
        status: "scheduled",
        result: null,
        kickoffUtc: "2026-06-14T17:00:00.000Z",
        homeScore: null,
        awayScore: null,
      })
    ).toEqual({ homeScore: null, awayScore: null });
  });

  test("parses finished match scores from numeric fields", () => {
    expect(
      getMatchScores({
        status: "finished",
        homeScore: 2,
        awayScore: 1,
      })
    ).toEqual({ homeScore: 2, awayScore: 1 });
  });

  test("stops treating scheduled matches as in progress after the max duration", () => {
    const lateNow = new Date("2026-06-14T20:00:00.000Z");

    expect(
      isMatchInProgress(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
        },
        lateNow
      )
    ).toBe(false);
  });
});
