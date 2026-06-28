const { buildBracketLookup } = require("../../api/_lib/fetch-bracket");
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
