import {
  formatGoalDifference,
  getGroupLetterFromStageKey,
  getStandingsForGroup,
  hasStandingsActivity,
  isGroupStageKey,
} from "./groupStandings";

describe("getGroupLetterFromStageKey", () => {
  it("maps group stage keys to uppercase letters", () => {
    expect(getGroupLetterFromStageKey("group_a")).toBe("A");
    expect(getGroupLetterFromStageKey("group_l")).toBe("L");
  });

  it("returns null for non-group stages", () => {
    expect(getGroupLetterFromStageKey("quarter_final")).toBeNull();
    expect(getGroupLetterFromStageKey("group_1")).toBeNull();
    expect(getGroupLetterFromStageKey(null)).toBeNull();
  });
});

describe("isGroupStageKey", () => {
  it("detects group stage keys", () => {
    expect(isGroupStageKey("group_c")).toBe(true);
    expect(isGroupStageKey("final")).toBe(false);
  });
});

describe("hasStandingsActivity", () => {
  it("detects rows with played matches or points", () => {
    expect(hasStandingsActivity([{ team: "Mexico", played: 0, points: 0 }])).toBe(
      false
    );
    expect(hasStandingsActivity([{ team: "Mexico", played: 1, points: 3 }])).toBe(
      true
    );
    expect(hasStandingsActivity([{ team: "Mexico", played: 0, points: 1 }])).toBe(
      true
    );
  });
});

describe("getStandingsForGroup", () => {
  const standings = {
    groups: {
      A: [
        { team: "Mexico", position: 1, points: 7, played: 3 },
        { team: "Poland", position: 2, points: 4, played: 3 },
      ],
      B: [{ team: "England", position: 1, points: 6, played: 2 }],
    },
  };

  it("returns sorted rows for a matching group", () => {
    expect(getStandingsForGroup(standings, "group_a").map((row) => row.team)).toEqual([
      "Mexico",
      "Poland",
    ]);
  });

  it("returns an empty array for unknown groups", () => {
    expect(getStandingsForGroup(standings, "group_z")).toEqual([]);
    expect(getStandingsForGroup(standings, "final")).toEqual([]);
  });
});

describe("formatGoalDifference", () => {
  it("formats signed goal differences", () => {
    expect(formatGoalDifference(4)).toBe("+4");
    expect(formatGoalDifference(-1)).toBe("-1");
    expect(formatGoalDifference(0)).toBe("0");
    expect(formatGoalDifference("bad")).toBe("0");
  });
});
