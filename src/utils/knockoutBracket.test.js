import {
  buildBracketkitRounds,
  hasKnockoutBracket,
} from "./knockoutBracket";

describe("hasKnockoutBracket", () => {
  it("returns false when rounds are missing or empty", () => {
    expect(hasKnockoutBracket(null)).toBe(false);
    expect(hasKnockoutBracket({ rounds: [] })).toBe(false);
    expect(hasKnockoutBracket({ rounds: [{ id: "final", matches: [] }] })).toBe(
      false
    );
  });

  it("returns true when at least one round has matches", () => {
    expect(
      hasKnockoutBracket({
        rounds: [{ id: "final", matches: [{ matchId: "2026-104" }] }],
      })
    ).toBe(true);
  });
});

describe("buildBracketkitRounds", () => {
  const bracket = {
    year: 2026,
    rounds: [
      {
        id: "round_of_32",
        matches: [
          {
            matchId: "2026-073",
            home: "Mexico",
            away: "Brazil",
            homeScore: 2,
            awayScore: 1,
            winner: "Mexico",
          },
          {
            matchId: "2026-074",
            home: null,
            away: null,
            homeRef: "1A",
            awayRef: "2B",
          },
        ],
      },
      {
        id: "final",
        matches: [
          {
            matchId: "2026-104",
            home: null,
            away: null,
            homeRef: "W101",
            awayRef: "W102",
          },
        ],
      },
    ],
  };

  it("maps rounds to bracketkit format with short labels", () => {
    const rounds = buildBracketkitRounds(bracket);

    expect(rounds).toHaveLength(2);
    expect(rounds[0].shortLabel).toBe("1/16");
    expect(rounds[1].shortLabel).toBe("F");
  });

  it("marks winners and TBD slots", () => {
    const rounds = buildBracketkitRounds(bracket);
    const playedMatch = rounds[0].matches[0];
    const tbdMatch = rounds[0].matches[1];

    expect(playedMatch.home.won).toBe(true);
    expect(playedMatch.away.lost).toBe(true);
    expect(playedMatch.home.fifaCode).toBe("MEX");
    expect(tbdMatch.home.isTbd).toBe(true);
    expect(tbdMatch.away.isTbd).toBe(true);
  });

  it("shows corrected rivals for Germany and France in the bracket tree", () => {
    const bracket = {
      year: 2026,
      rounds: [
        {
          id: "round_of_32",
          matches: [
            {
              matchId: "2026-074",
              home: "Germany",
              away: "Paraguay",
              homeScore: null,
              awayScore: null,
              winner: null,
            },
            {
              matchId: "2026-077",
              home: "France",
              away: "Sweden",
              homeScore: null,
              awayScore: null,
              winner: null,
            },
          ],
        },
      ],
    };

    const rounds = buildBracketkitRounds(bracket);
    const p74 = rounds[0].matches[0];
    const p77 = rounds[0].matches[1];

    expect(p74.home.fifaCode).toBe("GER");
    expect(p74.away.fifaCode).toBe("PAR");
    expect(p77.home.fifaCode).toBe("FRA");
    expect(p77.away.fifaCode).toBe("SWE");
  });
});
