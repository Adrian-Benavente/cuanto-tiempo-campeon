import {
  formatGoalMinute,
  getMatchDetailSections,
  getMatchLineupSide,
  getMatchStatRows,
  normalizeMatchEvents,
  normalizeMatchGoals,
} from "./matchDetailData";

describe("matchDetailData", () => {
  test("formatGoalMinute handles regular and stoppage time", () => {
    expect(formatGoalMinute({ minute: 45 })).toBe("45");
    expect(formatGoalMinute({ minute: 90, addedMinute: 5 })).toBe("90+5");
    expect(formatGoalMinute({ minute: null })).toBe("—");
  });

  test("normalizeMatchGoals sorts by minute", () => {
    const goals = normalizeMatchGoals({
      goals: [
        { minute: 82, team: "home", scorer: "Tillman", type: "normal" },
        { minute: 45, team: "home", scorer: "Balogun", type: "normal" },
      ],
    });

    expect(goals.map((goal) => goal.minuteLabel)).toEqual(["45", "82"]);
    expect(goals[0].scorer).toBe("Balogun");
  });

  test("normalizeMatchEvents merges cards and substitutions", () => {
    const events = normalizeMatchEvents({
      cards: [{ minute: 64, team: "home", player: "Balogun", color: "red" }],
      substitutions: [
        { minute: 87, team: "home", on: "Berhalter", off: "Dest" },
      ],
    });

    expect(events).toHaveLength(2);
    expect(events[0].kind).toBe("card");
    expect(events[1].kind).toBe("substitution");
  });

  test("getMatchStatRows returns comparable rows", () => {
    const rows = getMatchStatRows({
      statistics: {
        home: { possessionPct: 60, shotsTotal: 16, expectedGoals: 2.04 },
        away: { possessionPct: 40, shotsTotal: 7, expectedGoals: 0.8 },
      },
    });

    expect(rows.find((row) => row.key === "possessionPct")).toMatchObject({
      homeValue: 60,
      awayValue: 40,
      bar: true,
    });
  });

  test("getMatchLineupSide splits starters and substitutes", () => {
    const side = getMatchLineupSide([
      { player: "A", starter: true },
      { player: "B", starter: false },
    ]);

    expect(side.starters).toHaveLength(1);
    expect(side.substitutes).toHaveLength(1);
  });

  test("getMatchDetailSections flags available blocks", () => {
    const sections = getMatchDetailSections({
      goals: [{ minute: 1, team: "home", scorer: "X" }],
      statistics: { home: { possessionPct: 50 }, away: { possessionPct: 50 } },
      lineups: { home: [{ player: "A", starter: true }], away: [] },
      weather: { tempC: 21 },
      fairPlay: { home: -1, away: 0 },
      formations: { home: "4-3-3" },
      stadium: "Azteca",
      attendance: 1000,
      referee: { name: "Claus" },
    });

    expect(sections.hasGoals).toBe(true);
    expect(sections.hasStats).toBe(true);
    expect(sections.hasLineups).toBe(true);
    expect(sections.hasWeather).toBe(true);
    expect(sections.hasFairPlay).toBe(true);
    expect(sections.hasFormations).toBe(true);
    expect(sections.hasVenue).toBe(true);
    expect(sections.hasAttendance).toBe(true);
    expect(sections.hasReferee).toBe(true);
  });
});
