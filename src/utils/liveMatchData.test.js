import {
  getMatchPenaltyScores,
  getMatchScoreDisplay,
  getMatchScores,
  hasPenaltyShootout,
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

  test("does not include penalties for regular matches", () => {
    expect(
      getMatchScoreDisplay({
        homeScore: 2,
        awayScore: 1,
        penalties: null,
      })
    ).toEqual({
      homeScore: 2,
      awayScore: 1,
      homePenalties: null,
      awayPenalties: null,
      hasPenalties: false,
    });
    expect(hasPenaltyShootout({ homeScore: 2, awayScore: 1, penalties: null })).toBe(
      false
    );
  });

  test("parses penalty shootout scores from penalties.homeScore/awayScore", () => {
    const match = {
      homeScore: 1,
      awayScore: 1,
      extraTime: true,
      penalties: { homeScore: 3, awayScore: 4 },
    };

    expect(getMatchPenaltyScores(match)).toEqual({
      homePenalties: 3,
      awayPenalties: 4,
    });
    expect(getMatchScoreDisplay(match)).toEqual({
      homeScore: 1,
      awayScore: 1,
      homePenalties: 3,
      awayPenalties: 4,
      hasPenalties: true,
    });
    expect(hasPenaltyShootout(match)).toBe(true);
  });

  test("parses penalty shootout scores from penalties.home/away", () => {
    expect(
      getMatchPenaltyScores({
        homeScore: 0,
        awayScore: 0,
        penalties: { home: 5, away: 4 },
      })
    ).toEqual({
      homePenalties: 5,
      awayPenalties: 4,
    });
  });

  test("falls back to penaltyShootout when penalties is absent", () => {
    expect(
      getMatchPenaltyScores({
        homeScore: 1,
        awayScore: 1,
        penaltyShootout: { homeScore: 3, awayScore: 4 },
      })
    ).toEqual({
      homePenalties: 3,
      awayPenalties: 4,
    });
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
