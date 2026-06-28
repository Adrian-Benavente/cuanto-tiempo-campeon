const {
  applyCrossedFeederFixesToMatches,
  fixCrossedFeederNames,
  parseBestThirdRef,
  parseGroupPositionRef,
  resolveBestThirdRef,
  resolveBracketRef,
  resolveGroupPositionRef,
  resolveKnockoutSideName,
  resolveWinnerMatchRef,
} = require("../../api/_lib/resolve-bracket-ref");
const { buildMatchesByNo } = require("../../api/_lib/resolve-bracket-ref");

const STANDINGS = {
  groups: {
    E: [{ position: 2, team: "Germany", played: 2, points: 4 }],
    F: [{ position: 2, team: "Paraguay", played: 2, points: 3 }],
    I: [{ position: 2, team: "France", played: 2, points: 6 }],
    H: [{ position: 2, team: "Sweden", played: 2, points: 4 }],
    A: [
      {
        position: 3,
        team: "Mexico",
        points: 6,
        goalDifference: 2,
        goalsFor: 5,
        played: 3,
      },
    ],
    B: [
      {
        position: 3,
        team: "Japan",
        points: 4,
        goalDifference: 0,
        goalsFor: 3,
        played: 3,
      },
    ],
    C: [
      {
        position: 3,
        team: "Chile",
        points: 3,
        goalDifference: -1,
        goalsFor: 2,
        played: 3,
      },
    ],
  },
};

describe("parseGroupPositionRef", () => {
  it("parses FIFA group position codes", () => {
    expect(parseGroupPositionRef("2E")).toEqual({ position: 2, group: "E" });
    expect(parseGroupPositionRef("1A")).toEqual({ position: 1, group: "A" });
  });
});

describe("parseBestThirdRef", () => {
  it("parses best-third group combinations", () => {
    expect(parseBestThirdRef("3ABC")).toEqual(["A", "B", "C"]);
  });
});

describe("resolveGroupPositionRef", () => {
  it("returns the team in the requested group position", () => {
    expect(resolveGroupPositionRef("2E", STANDINGS)).toBe("Germany");
    expect(resolveGroupPositionRef("2F", STANDINGS)).toBe("Paraguay");
  });

  it("coerces string positions from the API", () => {
    const standings = {
      groups: {
        A: [{ position: "2", team: "Poland" }],
      },
    };

    expect(resolveGroupPositionRef("2A", standings)).toBe("Poland");
  });
});

describe("resolveBestThirdRef", () => {
  it("returns the highest-ranked third among the listed groups", () => {
    expect(resolveBestThirdRef("3ABC", STANDINGS)).toBe("Mexico");
  });
});

describe("resolveWinnerMatchRef", () => {
  it("returns the winner of a completed feeder match", () => {
    const matchesByNo = buildMatchesByNo([
      {
        id: "2026-074",
        matchNo: 74,
        homeTeam: "Germany",
        awayTeam: "Paraguay",
        homeScore: 2,
        awayScore: 0,
        winner: "Germany",
      },
    ]);

    expect(resolveWinnerMatchRef("W74", matchesByNo)).toBe("Germany");
  });
});

describe("resolveBracketRef", () => {
  it("does not resolve third-place refs for knockout names", () => {
    expect(resolveBracketRef("3ABC", { standings: STANDINGS, matches: [] })).toBeNull();
  });
});

describe("resolveKnockoutSideName", () => {
  it("prefers concrete bracket names over third-place refs", () => {
    const slot = {
      homeRef: "1A",
      awayRef: "3ABCDF",
      home: "Mexico",
      away: "Japan",
    };

    expect(
      resolveKnockoutSideName({
        slot,
        side: "away",
        standings: STANDINGS,
        matches: [],
      })
    ).toBe("Japan");
  });

  it("resolves group position refs when the group has standings activity", () => {
    const slot = {
      homeRef: "2A",
      awayRef: "2B",
      home: "2A",
      away: "2B",
    };

    const standings = {
      groups: {
        A: [{ position: 2, team: "Mexico", played: 1, points: 3 }],
        B: [{ position: 2, team: "Brazil", played: 1, points: 3 }],
      },
    };

    expect(
      resolveKnockoutSideName({
        slot,
        side: "home",
        standings,
        matches: [],
      })
    ).toBe("Mexico");
    expect(
      resolveKnockoutSideName({
        slot,
        side: "away",
        standings,
        matches: [],
      })
    ).toBe("Brazil");
  });

  it("resolves winner refs from match results", () => {
    const matches = [
      {
        id: "2026-074",
        matchNo: 74,
        homeTeam: "Germany",
        awayTeam: "Paraguay",
        homeScore: 1,
        awayScore: 0,
      },
    ];

    expect(
      resolveBracketRef("W74", {
        standings: STANDINGS,
        matches,
      })
    ).toBe("Germany");

    expect(
      resolveKnockoutSideName({
        slot: { homeRef: "W74", awayRef: "W77" },
        side: "home",
        standings: STANDINGS,
        matches,
      })
    ).toBe("Germany");
  });
});

describe("fixCrossedFeederNames", () => {
  it("uncrosses swapped away teams between sibling feeders", () => {
    const feeders = [
      {
        matchId: "2026-074",
        matchNo: 74,
        homeRef: "2E",
        awayRef: "2F",
        home: "Germany",
        away: "Sweden",
      },
      {
        matchId: "2026-077",
        matchNo: 77,
        homeRef: "2I",
        awayRef: "2H",
        home: "France",
        away: "Paraguay",
      },
    ];
    const parents = [
      { matchId: "2026-089", homeRef: "W74", awayRef: "W77" },
    ];

    const fixed = fixCrossedFeederNames(feeders, parents, { standings: STANDINGS });

    expect(fixed[0]).toMatchObject({ away: "Paraguay" });
    expect(fixed[1]).toMatchObject({ away: "Sweden" });
  });

  it("uncrosses swapped away teams using group membership without position rows", () => {
    const standings = {
      groups: {
        F: [
          { team: "Netherlands" },
          { team: "Paraguay" },
          { team: "Tunisia" },
        ],
        H: [
          { team: "Spain" },
          { team: "Sweden" },
          { team: "Ukraine" },
        ],
      },
    };
    const feeders = [
      {
        matchId: "2026-074",
        matchNo: 74,
        homeRef: "2E",
        awayRef: "2F",
        home: "Germany",
        away: "Sweden",
      },
      {
        matchId: "2026-077",
        matchNo: 77,
        homeRef: "2I",
        awayRef: "2H",
        home: "France",
        away: "Paraguay",
      },
    ];
    const parents = [
      { matchId: "2026-089", homeRef: "W74", awayRef: "W77" },
    ];

    const fixed = fixCrossedFeederNames(feeders, parents, { standings });

    expect(fixed[0]).toMatchObject({ away: "Paraguay" });
    expect(fixed[1]).toMatchObject({ away: "Sweden" });
  });

  it("uncrosses Belgium/Switzerland feeders with Senegal and Algeria swapped", () => {
    const standings = {
      groups: {
        G: [{ team: "Belgium" }, { team: "Iran" }],
        J: [{ team: "Algeria" }, { team: "Tunisia" }],
        I: [{ team: "Senegal" }, { team: "Norway" }],
        L: [{ team: "Switzerland" }, { team: "Canada" }],
      },
    };
    const feeders = [
      {
        matchId: "2026-080",
        matchNo: 80,
        homeRef: "2G",
        awayRef: "2I",
        home: "Belgium",
        away: "Algeria",
      },
      {
        matchId: "2026-081",
        matchNo: 81,
        homeRef: "2L",
        awayRef: "2J",
        home: "Switzerland",
        away: "Senegal",
      },
    ];
    const parents = [
      { matchId: "2026-093", homeRef: "W80", awayRef: "W81" },
    ];

    const fixed = fixCrossedFeederNames(feeders, parents, { standings });

    expect(fixed[0]).toMatchObject({ away: "Senegal" });
    expect(fixed[1]).toMatchObject({ away: "Algeria" });
  });
});

describe("applyCrossedFeederFixesToMatches", () => {
  it("applies feeder uncrossing to enriched fixture matches", () => {
    const bracketLookup = new Map([
      [
        "2026-074",
        {
          matchId: "2026-074",
          matchNo: 74,
          homeRef: "2E",
          awayRef: "2F",
          home: "Germany",
          away: "Sweden",
        },
      ],
      [
        "2026-077",
        {
          matchId: "2026-077",
          matchNo: 77,
          homeRef: "2I",
          awayRef: "2H",
          home: "France",
          away: "Paraguay",
        },
      ],
      [
        "2026-089",
        {
          matchId: "2026-089",
          matchNo: 89,
          homeRef: "W74",
          awayRef: "W77",
        },
      ],
    ]);

    const matches = [
      {
        id: "2026-074",
        stage: "round_of_32",
        homeTeam: "Germany",
        awayTeam: "Sweden",
      },
      {
        id: "2026-077",
        stage: "round_of_32",
        homeTeam: "France",
        awayTeam: "Paraguay",
      },
    ];

    const fixed = applyCrossedFeederFixesToMatches(
      matches,
      bracketLookup,
      STANDINGS
    );

    expect(fixed[0]).toMatchObject({ awayTeam: "Paraguay" });
    expect(fixed[1]).toMatchObject({ awayTeam: "Sweden" });
  });
});
