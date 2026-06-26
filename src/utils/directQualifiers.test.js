import {
  buildDirectQualifiersTable,
  getGroupRemainingMatches,
  hasClinchedTopTwo,
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

describe("hasClinchedTopTwo", () => {
  it("marks positions 1 and 2 as clinched when the group is complete", () => {
    const remaining = [];

    expect(hasClinchedTopTwo(GROUP_A_STANDINGS[0], GROUP_A_STANDINGS, remaining)).toBe(
      true
    );
    expect(hasClinchedTopTwo(GROUP_A_STANDINGS[1], GROUP_A_STANDINGS, remaining)).toBe(
      true
    );
    expect(hasClinchedTopTwo(GROUP_A_STANDINGS[2], GROUP_A_STANDINGS, remaining)).toBe(
      false
    );
  });

  it("detects a clinched leader when rivals cannot reach their points floor", () => {
    const standings = [
      { team: "Mexico", position: 1, points: 7, played: 2 },
      { team: "South Korea", position: 2, points: 4, played: 2 },
      { team: "South Africa", position: 3, points: 1, played: 2 },
      { team: "Qatar", position: 4, points: 0, played: 2 },
    ];
    const remaining = [
      { stage: "group_a", homeTeam: "Mexico", awayTeam: "Qatar", status: "scheduled" },
      { stage: "group_a", homeTeam: "South Korea", awayTeam: "South Africa", status: "scheduled" },
    ];

    expect(hasClinchedTopTwo(standings[0], standings, remaining)).toBe(true);
  });

  it("does not mark a team as clinched when a rival can still overtake on points", () => {
    const remaining = [
      { stage: "group_b", homeTeam: "Scotland", awayTeam: "Haiti", status: "scheduled" },
      { stage: "group_b", homeTeam: "Brazil", awayTeam: "Switzerland", status: "scheduled" },
    ];

    expect(
      hasClinchedTopTwo(GROUP_B_IN_PROGRESS[1], GROUP_B_IN_PROGRESS, remaining)
    ).toBe(false);
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

  it("includes clinched teams from completed and live groups", () => {
    const { rows } = buildDirectQualifiersTable({
      standings: {
        groups: {
          A: GROUP_A_STANDINGS,
          B: GROUP_B_IN_PROGRESS,
        },
      },
      matches: [
        { stage: "group_b", homeTeam: "Scotland", awayTeam: "Haiti", status: "scheduled" },
        { stage: "group_b", homeTeam: "Brazil", awayTeam: "Switzerland", status: "scheduled" },
      ],
      year: 2026,
    });

    expect(rows.map((row) => row.team)).toEqual(["Mexico", "South Korea"]);
  });

  it("returns no rows when no group has clinched teams yet", () => {
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
        matches: [],
        year: 2026,
      }).rows
    ).toEqual([]);
  });
});
