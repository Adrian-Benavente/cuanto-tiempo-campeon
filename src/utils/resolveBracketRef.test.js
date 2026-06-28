const {
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
    E: [{ position: 2, team: "Germany" }],
    F: [{ position: 2, team: "Paraguay" }],
    I: [{ position: 2, team: "France" }],
    H: [{ position: 2, team: "Sweden" }],
    A: [{ position: 3, team: "Mexico", points: 6, goalDifference: 2, goalsFor: 5 }],
    B: [{ position: 3, team: "Japan", points: 4, goalDifference: 0, goalsFor: 3 }],
    C: [{ position: 3, team: "Chile", points: 3, goalDifference: -1, goalsFor: 2 }],
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

describe("resolveKnockoutSideName", () => {
  it("prefers FIFA refs over swapped Zafronix bracket names", () => {
    const slot = {
      homeRef: "2E",
      awayRef: "2F",
      home: "Germany",
      away: "Sweden",
    };

    expect(
      resolveKnockoutSideName({
        slot,
        side: "home",
        standings: STANDINGS,
        matches: [],
      })
    ).toBe("Germany");
    expect(
      resolveKnockoutSideName({
        slot,
        side: "away",
        standings: STANDINGS,
        matches: [],
      })
    ).toBe("Paraguay");
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
  });
});
