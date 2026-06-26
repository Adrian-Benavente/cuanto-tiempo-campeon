import {
  buildBestThirdPlaceTable,
  buildFairPlayByTeam,
  buildFifaRankLookup,
  extractThirdPlaceTeams,
  getFifaRank,
  hasBestThirdPlaceActivity,
  isGroupStageComplete,
  rankBestThirdPlace,
} from "./bestThirdPlace";

const SAMPLE_STANDINGS = {
  groups: {
    A: [
      { team: "Mexico", position: 1, points: 7, goalDifference: 3, goalsFor: 5, played: 3 },
      { team: "South Korea", position: 2, points: 4, goalDifference: 0, goalsFor: 3, played: 3 },
      { team: "South Africa", position: 3, points: 3, goalDifference: -1, goalsFor: 2, played: 2, advanced: true },
      { team: "Qatar", position: 4, points: 0, goalDifference: -2, goalsFor: 1, played: 3 },
    ],
    B: [
      { team: "Switzerland", position: 1, points: 7, goalDifference: 2, goalsFor: 4, played: 3 },
      { team: "Brazil", position: 2, points: 5, goalDifference: 1, goalsFor: 4, played: 3 },
      { team: "Scotland", position: 3, points: 3, goalDifference: 0, goalsFor: 2, played: 2, advanced: false },
      { team: "Haiti", position: 4, points: 1, goalDifference: -3, goalsFor: 1, played: 3 },
    ],
    C: [
      { team: "England", position: 1, points: 6, goalDifference: 2, goalsFor: 4, played: 2 },
      { team: "Denmark", position: 2, points: 4, goalDifference: 1, goalsFor: 3, played: 2 },
      { team: "Ecuador", position: 3, points: 3, goalDifference: -1, goalsFor: 2, played: 2, advanced: true },
      { team: "Jordan", position: 4, points: 0, goalDifference: -2, goalsFor: 0, played: 2 },
    ],
  },
};

const FIFA_LOOKUP = buildFifaRankLookup({
  teams: {
    "South Africa": 60,
    Scotland: 42,
    Ecuador: 23,
  },
});

describe("extractThirdPlaceTeams", () => {
  it("extracts one third-place team per populated group", () => {
    const teams = extractThirdPlaceTeams(SAMPLE_STANDINGS);

    expect(teams).toHaveLength(3);
    expect(teams.map((team) => team.team)).toEqual([
      "South Africa",
      "Scotland",
      "Ecuador",
    ]);
  });
});

describe("hasBestThirdPlaceActivity", () => {
  it("returns false when no third-place team has played", () => {
    expect(
      hasBestThirdPlaceActivity([
        { team: "A", played: 0 },
        { team: "B", played: 0 },
      ])
    ).toBe(false);
  });

  it("returns true when at least one third-place team has played", () => {
    expect(hasBestThirdPlaceActivity(extractThirdPlaceTeams(SAMPLE_STANDINGS))).toBe(
      true
    );
  });
});

describe("rankBestThirdPlace", () => {
  it("orders teams by points, goal difference, and goals scored", () => {
    const teams = [
      { team: "Low", points: 1, goalDifference: -2, goalsFor: 1, played: 3 },
      { team: "High", points: 4, goalDifference: 2, goalsFor: 5, played: 3 },
      { team: "Mid", points: 3, goalDifference: 0, goalsFor: 3, played: 3 },
    ];

    expect(rankBestThirdPlace(teams, { fifaRankLookup: FIFA_LOOKUP }).map((team) => team.team)).toEqual([
      "High",
      "Mid",
      "Low",
    ]);
  });

  it("breaks ties with fair play when group stats are equal", () => {
    const teams = [
      { team: "Scotland", points: 3, goalDifference: 0, goalsFor: 2, played: 2 },
      { team: "South Africa", points: 3, goalDifference: 0, goalsFor: 2, played: 2 },
    ];
    const fairPlayByTeam = {
      scotland: -1,
      "south africa": -3,
    };

    expect(
      rankBestThirdPlace(teams, { fairPlayByTeam, fifaRankLookup: FIFA_LOOKUP }).map(
        (team) => team.team
      )
    ).toEqual(["Scotland", "South Africa"]);
  });

  it("uses FIFA ranking as the final tiebreaker", () => {
    const teams = [
      { team: "Scotland", points: 3, goalDifference: 0, goalsFor: 2, played: 2 },
      { team: "Ecuador", points: 3, goalDifference: 0, goalsFor: 2, played: 2 },
    ];

    expect(
      rankBestThirdPlace(teams, {
        fairPlayByTeam: { scotland: 0, ecuador: 0 },
        fifaRankLookup: FIFA_LOOKUP,
      }).map((team) => team.team)
    ).toEqual(["Ecuador", "Scotland"]);
  });
});

describe("buildFairPlayByTeam", () => {
  it("aggregates fair play from group-stage matches", () => {
    const totals = buildFairPlayByTeam([
      {
        stage: "group_a",
        homeTeam: "Mexico",
        awayTeam: "Qatar",
        fairPlay: { home: -2, away: -1 },
      },
      {
        stage: "group_b",
        homeTeam: "Scotland",
        awayTeam: "Brazil",
        cards: [
          { team: "home", color: "yellow" },
          { team: "away", color: "red" },
        ],
      },
    ]);

    expect(totals.mexico).toBe(-2);
    expect(totals.scotland).toBe(-1);
    expect(totals.brazil).toBe(-4);
  });
});

describe("buildBestThirdPlaceTable", () => {
  it("returns no rows outside the 2026 tournament", () => {
    expect(
      buildBestThirdPlaceTable({
        standings: SAMPLE_STANDINGS,
        year: 2022,
        fifaRankLookup: FIFA_LOOKUP,
      }).rows
    ).toEqual([]);
  });

  it("marks advanced teams as qualifiers when Zafronix provides the flag", () => {
    const { rows, isProjection } = buildBestThirdPlaceTable({
      standings: SAMPLE_STANDINGS,
      year: 2026,
      fifaRankLookup: FIFA_LOOKUP,
    });

    expect(isProjection).toBe(true);
    expect(rows.find((row) => row.team === "South Africa")?.qualifies).toBe(true);
    expect(rows.find((row) => row.team === "Scotland")?.qualifies).toBe(false);
  });

  it("projects the top eight when advanced flags are not available yet", () => {
    const standings = {
      groups: {
        A: [
          { team: "A1", position: 1, points: 9, played: 3 },
          { team: "A2", position: 2, points: 6, played: 3 },
          { team: "A3", position: 3, points: 3, played: 1 },
          { team: "A4", position: 4, points: 0, played: 3 },
        ],
      },
    };

    const { rows } = buildBestThirdPlaceTable({
      standings,
      year: 2026,
      fifaRankLookup: FIFA_LOOKUP,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].qualifies).toBe(true);
  });
});

describe("isGroupStageComplete", () => {
  it("requires every third-place team to finish three matches", () => {
    expect(isGroupStageComplete(extractThirdPlaceTeams(SAMPLE_STANDINGS))).toBe(false);
    expect(
      isGroupStageComplete([
        { played: 3 },
        { played: 3 },
        { played: 3 },
      ])
    ).toBe(true);
  });
});

describe("getFifaRank", () => {
  it("resolves aliases from the snapshot lookup", () => {
    const lookup = buildFifaRankLookup({
      teams: { Mexico: 14 },
      aliases: [{ names: ["México"], rank: 14 }],
    });

    expect(getFifaRank("México", lookup)).toBe(14);
  });
});
