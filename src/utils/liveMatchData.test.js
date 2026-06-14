import {
  detectScoreChange,
  formatLastGoalLabel,
  getLastGoalEvent,
  getMatchScores,
  getMatchStatus,
  getMatchStatusLabel,
} from "./liveMatchData";

describe("liveMatchData", () => {
  test("extracts last goal from events", () => {
    const goal = getLastGoalEvent({
      events: [
        { type: "goal", minute: 12, scorer: "Messi", team: "Argentina" },
        { type: "goal", minute: 67, scorer: "Álvarez", team: "Argentina" },
      ],
    });

    expect(goal).toEqual({
      minute: 67,
      scorer: "Álvarez",
      team: "Argentina",
      source: "events",
    });
  });

  test("falls back to goals array when events are missing", () => {
    const goal = getLastGoalEvent({
      goals: [{ minute: 55, scorer: "Mbappé", team: "France" }],
    });

    expect(goal?.scorer).toBe("Mbappé");
    expect(goal?.source).toBe("goals");
  });

  test("detects score increases between polls", () => {
    const change = detectScoreChange(
      { homeScore: 1, awayScore: 0 },
      { homeScore: 2, awayScore: 0 }
    );

    expect(change).toEqual({ homeChanged: true, awayChanged: false });
  });

  test("formats status labels", () => {
    expect(getMatchStatus({ status: "live" })).toBe("live");
    expect(getMatchStatusLabel({ status: "halftime" }, "es")).toBe("Entretiempo");
    expect(getMatchStatusLabel({ status: "live" }, "en")).toBe("Live");
  });

  test("treats scheduled matches with past kickoff as live", () => {
    const now = new Date("2026-06-14T18:30:00.000Z");

    expect(
      getMatchStatus(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
        },
        now
      )
    ).toBe("live");

    expect(
      getMatchStatusLabel(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
        },
        "es",
        now
      )
    ).toBe("En vivo");
  });

  test("formats last goal label with scorer when available", () => {
    expect(
      formatLastGoalLabel({ minute: 23, scorer: "Messi", team: "Argentina" }, "es")
    ).toBe("23' Messi");
  });

  test("derives scores from goals when numeric scores are missing", () => {
    const now = new Date("2026-06-14T18:30:00.000Z");

    expect(
      getMatchScores(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
          goals: [{ minute: 23, team: "home", scorer: "Havertz" }],
        },
        now
      )
    ).toEqual({ homeScore: 1, awayScore: 0 });
  });

  test("defaults to 0-0 for in-progress matches without score data", () => {
    const now = new Date("2026-06-14T18:30:00.000Z");

    expect(
      getMatchScores(
        {
          status: "scheduled",
          result: null,
          kickoffUtc: "2026-06-14T17:00:00.000Z",
        },
        now
      )
    ).toEqual({ homeScore: 0, awayScore: 0 });
  });
});
