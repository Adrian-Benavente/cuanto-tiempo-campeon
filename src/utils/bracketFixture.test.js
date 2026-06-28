const {
  buildBracketLookup,
  buildKnockoutBracket,
  getMatchNo,
  orderRoundMatchesForTree,
  parseWinnerRef,
  sortBracketRoundsForTree,
} = require("../../api/_lib/fetch-bracket");
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
      matchNo: 73,
      home: "Mexico",
      away: null,
      homeRef: "2A",
      awayRef: "2B",
    });
    expect(lookup.get("2026-104")?.home).toBeNull();
  });
});

describe("parseWinnerRef", () => {
  it("parses FIFA winner placeholders", () => {
    expect(parseWinnerRef("W73")).toBe(73);
    expect(parseWinnerRef("w74")).toBe(74);
    expect(parseWinnerRef("2A")).toBeNull();
  });
});

describe("orderRoundMatchesForTree", () => {
  it("orders round of 32 feeders based on round of 16 winner refs", () => {
    const roundOf32 = [
      { matchId: "2026-073", matchNo: 73, home: "South Africa", away: "Canada" },
      { matchId: "2026-074", matchNo: 74, home: "Germany", away: "Paraguay" },
      { matchId: "2026-075", matchNo: 75, home: "Netherlands", away: "Morocco" },
      { matchId: "2026-077", matchNo: 77, home: "France", away: "Sweden" },
    ];
    const roundOf16 = [
      { matchId: "2026-089", matchNo: 89, homeRef: "W74", awayRef: "W77" },
      { matchId: "2026-090", matchNo: 90, homeRef: "W73", awayRef: "W75" },
    ];

    expect(orderRoundMatchesForTree(roundOf32, roundOf16).map(getMatchNo)).toEqual([
      74, 77, 73, 75,
    ]);
  });
});

describe("sortBracketRoundsForTree", () => {
  it("propagates ordering from later rounds back to earlier rounds", () => {
    const rounds = [
      {
        id: "round_of_16",
        matches: [
          { matchId: "2026-090", matchNo: 90, homeRef: "W73", awayRef: "W75" },
          { matchId: "2026-089", matchNo: 89, homeRef: "W74", awayRef: "W77" },
        ],
      },
      {
        id: "quarter_final",
        matches: [
          { matchId: "2026-097", matchNo: 97, homeRef: "W89", awayRef: "W90" },
        ],
      },
      {
        id: "semi_final",
        matches: [
          { matchId: "2026-101", matchNo: 101, homeRef: "W97", awayRef: "W98" },
          { matchId: "2026-102", matchNo: 102, homeRef: "W99", awayRef: "W100" },
        ],
      },
      {
        id: "final",
        matches: [
          { matchId: "2026-104", matchNo: 104, homeRef: "W101", awayRef: "W102" },
        ],
      },
    ];

    sortBracketRoundsForTree(rounds);

    expect(rounds[0].matches.map(getMatchNo)).toEqual([89, 90]);
    expect(rounds[2].matches.map(getMatchNo)).toEqual([101, 102]);
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
      matchNo: 73,
      homeScore: 2,
      awayScore: 1,
      winner: "Mexico",
    });
  });

  it("orders round of 32 matches for the official FIFA bracket tree", () => {
    const standings = {
      groups: {
        E: [{ position: 2, team: "Germany" }],
        F: [{ position: 2, team: "Paraguay" }],
        I: [{ position: 2, team: "France" }],
        H: [{ position: 2, team: "Sweden" }],
      },
    };

    const bracket = buildKnockoutBracket(
      {
        year: 2026,
        stages: {
          round_of_32: [
            {
              matchId: "2026-073",
              matchNo: 73,
              home: "South Africa",
              away: "Canada",
            },
            {
              matchId: "2026-074",
              matchNo: 74,
              homeRef: "2E",
              awayRef: "2F",
              home: "Germany",
              away: "Sweden",
            },
            {
              matchId: "2026-075",
              matchNo: 75,
              home: "Netherlands",
              away: "Morocco",
            },
            {
              matchId: "2026-077",
              matchNo: 77,
              homeRef: "2I",
              awayRef: "2H",
              home: "France",
              away: "Paraguay",
            },
          ],
          round_of_16: [
            {
              matchId: "2026-089",
              matchNo: 89,
              homeRef: "W74",
              awayRef: "W77",
            },
            {
              matchId: "2026-090",
              matchNo: 90,
              homeRef: "W73",
              awayRef: "W75",
            },
          ],
        },
      },
      [],
      standings
    );

    expect(bracket.rounds[0].matches.map(getMatchNo)).toEqual([74, 77, 73, 75]);
    expect(bracket.rounds[1].matches.map(getMatchNo)).toEqual([89, 90]);

    const p74 = bracket.rounds[0].matches.find((match) => match.matchNo === 74);
    const p77 = bracket.rounds[0].matches.find((match) => match.matchNo === 77);

    expect(p74).toMatchObject({ home: "Germany", away: "Paraguay" });
    expect(p77).toMatchObject({ home: "France", away: "Sweden" });
  });

  it("uncrosses permuted away teams using group membership without position rows", () => {
    const standings = {
      groups: {
        F: [{ team: "Netherlands" }, { team: "Paraguay" }],
        H: [{ team: "Spain" }, { team: "Sweden" }],
        G: [{ team: "Belgium" }],
        J: [{ team: "Algeria" }],
        I: [{ team: "Senegal" }],
        L: [{ team: "Switzerland" }],
      },
    };

    const bracket = buildKnockoutBracket(
      {
        year: 2026,
        stages: {
          round_of_32: [
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
          ],
          round_of_16: [
            {
              matchId: "2026-089",
              matchNo: 89,
              homeRef: "W74",
              awayRef: "W77",
            },
            {
              matchId: "2026-093",
              matchNo: 93,
              homeRef: "W80",
              awayRef: "W81",
            },
          ],
        },
      },
      [],
      standings
    );

    const p74 = bracket.rounds[0].matches.find((match) => match.matchNo === 74);
    const p77 = bracket.rounds[0].matches.find((match) => match.matchNo === 77);
    const p80 = bracket.rounds[0].matches.find((match) => match.matchNo === 80);
    const p81 = bracket.rounds[0].matches.find((match) => match.matchNo === 81);

    expect(p74).toMatchObject({ away: "Paraguay" });
    expect(p77).toMatchObject({ away: "Sweden" });
    expect(p80).toMatchObject({ away: "Senegal" });
    expect(p81).toMatchObject({ away: "Algeria" });
  });

  it("keeps distinct third-place rivals from the bracket instead of one global third", () => {
    const standings = {
      groups: {
        H: [
          {
            position: 3,
            team: "Sweden",
            points: 6,
            goalDifference: 2,
            goalsFor: 4,
            played: 3,
          },
        ],
        A: [
          {
            position: 3,
            team: "Mexico",
            points: 3,
            goalDifference: 0,
            goalsFor: 2,
            played: 3,
          },
        ],
      },
    };

    const bracket = buildKnockoutBracket(
      {
        year: 2026,
        stages: {
          round_of_32: [
            {
              matchId: "2026-073",
              matchNo: 73,
              homeRef: "1A",
              awayRef: "3CEFHI",
              home: "Mexico",
              away: "USA",
            },
            {
              matchId: "2026-075",
              matchNo: 75,
              homeRef: "1B",
              awayRef: "3ABCDF",
              home: "Switzerland",
              away: "Chile",
            },
          ],
        },
      },
      [],
      standings
    );

    const p73 = bracket.rounds[0].matches.find((match) => match.matchNo === 73);
    const p75 = bracket.rounds[0].matches.find((match) => match.matchNo === 75);

    expect(p73).toMatchObject({ home: "Mexico", away: "USA" });
    expect(p75).toMatchObject({ home: "Switzerland", away: "Chile" });
    expect(p73.away).not.toBe(p75.away);
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

  it("resolves swapped Zafronix names from FIFA refs and standings", () => {
    const standings = {
      groups: {
        E: [{ position: 2, team: "Germany" }],
        F: [{ position: 2, team: "Paraguay" }],
        I: [{ position: 2, team: "France" }],
        H: [{ position: 2, team: "Sweden" }],
      },
    };
    const lookup = buildBracketLookup({
      stages: {
        round_of_32: [
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
        ],
        round_of_16: [
          {
            matchId: "2026-089",
            matchNo: 89,
            homeRef: "W74",
            awayRef: "W77",
          },
        ],
      },
    });
    const matches = [
      {
        id: "2026-074",
        stage: "round_of_32",
        homeRef: "2E",
        awayRef: "2F",
        homeTeam: "Germany",
        awayTeam: "Sweden",
      },
      {
        id: "2026-077",
        stage: "round_of_32",
        homeRef: "2I",
        awayRef: "2H",
        homeTeam: "France",
        awayTeam: "Paraguay",
      },
    ];

    const enriched = enrichMatchesWithBracket(matches, lookup, { standings });

    expect(enriched[0]).toMatchObject({
      homeTeam: "Germany",
      awayTeam: "Paraguay",
    });
    expect(enriched[1]).toMatchObject({
      homeTeam: "France",
      awayTeam: "Sweden",
    });
  });
});
