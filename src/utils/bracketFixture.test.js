const { buildBracketLookup, buildKnockoutBracket } = require("../../api/_lib/fetch-bracket");
const { enrichMatchesWithBracket } = require("../../api/_lib/fetch-world-cup-fixture");

describe("buildBracketLookup", () => {
  it("flattens bracket stages into a matchId lookup", () => {
    const lookup = buildBracketLookup({
      year: 2026,
      stages: {
        round_of_32: [
          {
            matchId: "2026-073",
            homeRef: "2A",
            awayRef: "2B",
            home: "Mexico",
            away: null,
          },
        ],
        final: [
          {
            matchId: "2026-104",
            homeRef: "W101",
            awayRef: "W102",
            home: null,
            away: null,
          },
        ],
      },
    });

    expect(lookup.get("2026-073")).toEqual({
      matchId: "2026-073",
      home: "Mexico",
      away: null,
      homeRef: "2A",
      awayRef: "2B",
    });
    expect(lookup.get("2026-104")?.home).toBeNull();
  });
});

describe("buildKnockoutBracket", () => {
  const bracketPayload = {
    year: 2026,
    stages: {
      round_of_32: [
        {
          matchId: "2026-073",
          home: "Mexico",
          away: "Brazil",
          homeScore: null,
          awayScore: null,
          winner: null,
        },
      ],
      round_of_16: [
        {
          matchId: "2026-089",
          home: null,
          away: null,
          homeRef: "W73",
          awayRef: "W74",
        },
      ],
      third_place: [
        {
          matchId: "2026-103",
          home: null,
          away: null,
        },
      ],
      final: [
        {
          matchId: "2026-104",
          home: null,
          away: null,
          homeRef: "W101",
          awayRef: "W102",
        },
      ],
    },
  };

  it("returns rounds in fixed order and excludes third place", () => {
    const bracket = buildKnockoutBracket(bracketPayload, []);

    expect(bracket.year).toBe(2026);
    expect(bracket.rounds.map((round) => round.id)).toEqual([
      "round_of_32",
      "round_of_16",
      "final",
    ]);
  });

  it("merges scores and winner from fixture matches when bracket slots are empty", () => {
    const matches = [
      {
        id: "2026-073",
        homeScore: 2,
        awayScore: 1,
        winner: "Mexico",
      },
    ];

    const bracket = buildKnockoutBracket(bracketPayload, matches);
    const r32Match = bracket.rounds[0].matches[0];

    expect(r32Match).toMatchObject({
      matchId: "2026-073",
      homeScore: 2,
      awayScore: 1,
      winner: "Mexico",
    });
  });
});

describe("enrichMatchesWithBracket", () => {
  const bracketLookup = buildBracketLookup({
    stages: {
      round_of_32: [
        {
          matchId: "2026-073",
          homeRef: "2A",
          awayRef: "2B",
          home: "Mexico",
          away: "Brazil",
        },
      ],
    },
  });

  it("resolves knockout team names from the bracket lookup", () => {
    const matches = [
      {
        id: "2026-073",
        stage: "round_of_32",
        homeRef: "2A",
        awayRef: "2B",
        homeTeam: "2A",
        awayTeam: "2B",
      },
      {
        id: "2026-001",
        stage: "group_a",
        homeTeam: "Mexico",
        awayTeam: "South Africa",
      },
    ];

    const enriched = enrichMatchesWithBracket(matches, bracketLookup);

    expect(enriched[0]).toMatchObject({
      homeTeam: "Mexico",
      awayTeam: "Brazil",
      homeRef: "2A",
      awayRef: "2B",
    });
    expect(enriched[1]).toEqual(matches[1]);
  });

  it("leaves matches unchanged when bracket data is missing", () => {
    const matches = [
      {
        id: "2026-099",
        stage: "round_of_32",
        homeRef: "1C",
        awayTeam: "1D",
      },
    ];

    expect(enrichMatchesWithBracket(matches, bracketLookup)).toEqual(matches);
  });
});
