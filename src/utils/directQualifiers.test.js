import {
  buildDirectQualifiersTable,
  getGroupRemainingMatches,
  isConfirmedDirectQualifier,
  isGroupComplete,
} from "./directQualifiers";

const GROUP_A_STANDINGS = [
  { team: "Mexico", position: 1, points: 7, goalDifference: 3, goalsFor: 5, played: 3 },
  { team: "South Korea", position: 2, points: 4, goalDifference: 0, goalsFor: 3, played: 3 },
  { team: "South Africa", position: 3, points: 3, goalDifference: -1, goalsFor: 2, played: 3 },
  { team: "Qatar", position: 4, points: 0, goalDifference: -2, goalsFor: 1, played: 3 },
];

const GROUP_B_IN_PROGRESS = [
  { team: "Switzerland", position: 1, points: 4, goalDifference: 2, goalsFor: 3, played: 2 },
  { team: "Brazil", position: 2, points: 4, goalDifference: 1, goalsFor: 3, played: 2 },
  { team: "Scotland", position: 3, points: 3, goalDifference: 0, goalsFor: 2, played: 2 },
  { team: "Haiti", position: 4, points: 0, goalDifference: -3, goalsFor: 0, played: 2 },
];

const GROUP_H_BEFORE_FINAL = [
  { team: "Spain", position: 1, points: 4, goalDifference: 2, played: 2 },
  { team: "Uruguay", position: 2, points: 2, goalDifference: 0, played: 2 },
  { team: "Cape Verde", position: 3, points: 2, goalDifference: 0, played: 2 },
  { team: "Saudi Arabia", position: 4, points: 1, goalDifference: -2, played: 2 },
];

const GROUP_H_COMPLETE = [
  { team: "Spain", position: 1, points: 7, goalDifference: 4, played: 3 },
  { team: "Cape Verde", position: 2, points: 3, goalDifference: 0, played: 3 },
  { team: "Uruguay", position: 3, points: 2, goalDifference: -1, played: 3 },
  { team: "Saudi Arabia", position: 4, points: 1, goalDifference: -3, played: 3 },
];

describe("getGroupRemainingMatches", () => {
  it("returns unfinished group matches for a letter", () => {
    const remaining = getGroupRemainingMatches(
      [
        {
          stage: "group_b",
          homeTeam: "Scotland",
          awayTeam: "Haiti",
          status: "scheduled",
        },
        {
          stage: "group_b",
          homeTeam: "Brazil",
          awayTeam: "Switzerland",
          status: "finished",
          result: "1-0",
        },
      ],
      "B"
    );

    expect(remaining).toHaveLength(1);
    expect(remaining[0].homeTeam).toBe("Scotland");
  });
});

describe("isConfirmedDirectQualifier", () => {
  it("marks positions 1 and 2 as confirmed when the group is complete", () => {
    expect(isConfirmedDirectQualifier(GROUP_A_STANDINGS[0], GROUP_A_STANDINGS)).toBe(
      true
    );
    expect(isConfirmedDirectQualifier(GROUP_A_STANDINGS[1], GROUP_A_STANDINGS)).toBe(
      true
    );
    expect(isConfirmedDirectQualifier(GROUP_A_STANDINGS[2], GROUP_A_STANDINGS)).toBe(
      false
    );
  });

  it("confirms a team when Zafronix sets advanced before the group closes", () => {
    const standings = [
      { team: "Mexico", position: 1, points: 7, played: 2, advanced: true },
      { team: "South Korea", position: 2, points: 4, played: 2 },
      { team: "South Africa", position: 3, points: 1, played: 2 },
      { team: "Qatar", position: 4, points: 0, played: 2 },
    ];

    expect(isConfirmedDirectQualifier(standings[0], standings)).toBe(true);
    expect(isConfirmedDirectQualifier(standings[1], standings)).toBe(false);
  });

  it("does not confirm provisional top-two teams while the group is still open", () => {
    expect(
      isConfirmedDirectQualifier(GROUP_B_IN_PROGRESS[1], GROUP_B_IN_PROGRESS)
    ).toBe(false);
    expect(
      isConfirmedDirectQualifier(GROUP_H_BEFORE_FINAL[1], GROUP_H_BEFORE_FINAL)
    ).toBe(false);
  });
});

describe("isGroupComplete", () => {
  it("returns true only when every team has played three matches", () => {
    expect(isGroupComplete(GROUP_A_STANDINGS)).toBe(true);
    expect(isGroupComplete(GROUP_B_IN_PROGRESS)).toBe(false);
  });
});

describe("buildDirectQualifiersTable", () => {
  it("returns no rows outside the 2026 tournament", () => {
    expect(
      buildDirectQualifiersTable({
        standings: { groups: { A: GROUP_A_STANDINGS } },
        year: 2022,
      }).rows
    ).toEqual([]);
  });

  it("includes confirmed teams from completed groups only", () => {
    const { rows } = buildDirectQualifiersTable({
      standings: {
        groups: {
          A: GROUP_A_STANDINGS,
          B: GROUP_B_IN_PROGRESS,
        },
      },
      year: 2026,
    });

    expect(rows.map((row) => row.team)).toEqual(["Mexico", "South Korea"]);
  });

  it("lists no teams from an open group before the final matchday", () => {
    const { rows } = buildDirectQualifiersTable({
      standings: {
        groups: {
          H: GROUP_H_BEFORE_FINAL,
        },
      },
      year: 2026,
    });

    expect(rows).toEqual([]);
  });

  it("lists final top-two teams after the group closes", () => {
    const { rows } = buildDirectQualifiersTable({
      standings: {
        groups: {
          H: GROUP_H_COMPLETE,
        },
      },
      year: 2026,
    });

    expect(rows.map((row) => row.team)).toEqual(["Spain", "Cape Verde"]);
  });

  it("includes advanced teams even when the group is still open", () => {
    const standings = [
      { team: "Mexico", position: 1, points: 7, played: 2, advanced: true },
      { team: "South Korea", position: 2, points: 4, played: 2, advanced: true },
      { team: "South Africa", position: 3, points: 1, played: 2 },
      { team: "Qatar", position: 4, points: 0, played: 2 },
    ];

    const { rows } = buildDirectQualifiersTable({
      standings: { groups: { A: standings } },
      year: 2026,
    });

    expect(rows.map((row) => row.team)).toEqual(["Mexico", "South Korea"]);
  });

  it("returns no rows when no group has confirmed teams yet", () => {
    const standings = {
      groups: {
        B: [
          { team: "Switzerland", position: 1, points: 0, played: 0 },
          { team: "Brazil", position: 2, points: 0, played: 0 },
          { team: "Scotland", position: 3, points: 0, played: 0 },
          { team: "Haiti", position: 4, points: 0, played: 0 },
        ],
      },
    };

    expect(
      buildDirectQualifiersTable({
        standings,
        year: 2026,
      }).rows
    ).toEqual([]);
  });
});
