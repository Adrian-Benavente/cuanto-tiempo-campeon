const {
  extractMatches,
  formatFinalSummary,
  formatHost,
  getTeamName,
} = require("../../api/_lib/zafronix-normalize");
const { resolveCountryMeta } = require("../../api/_lib/country-meta");

describe("formatHost", () => {
  it("joins host country arrays with commas", () => {
    expect(formatHost(["United States", "Canada", "Mexico"])).toBe(
      "United States, Canada, Mexico"
    );
  });

  it("returns string hosts unchanged", () => {
    expect(formatHost("Qatar")).toBe("Qatar");
  });

  it("returns an empty string for missing hosts", () => {
    expect(formatHost(null)).toBe("");
    expect(formatHost(undefined)).toBe("");
  });
});

describe("extractMatches", () => {
  it("reads Zafronix match lists from data", () => {
    const matches = extractMatches({
      year: 2022,
      count: 1,
      data: [
        {
          stage: "final",
          homeTeam: "Argentina",
          awayTeam: "France",
          homeScore: 3,
          awayScore: 3,
        },
      ],
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].homeTeam).toBe("Argentina");
  });

  it("falls back to matches and arrays", () => {
    expect(extractMatches({ matches: [{ id: "a" }] })).toEqual([{ id: "a" }]);
    expect(extractMatches([{ id: "b" }])).toEqual([{ id: "b" }]);
    expect(extractMatches({ year: 2022 })).toEqual([]);
  });
});

describe("getTeamName", () => {
  it("supports string and object team shapes", () => {
    expect(getTeamName("Argentina")).toBe("Argentina");
    expect(getTeamName({ name: "France" })).toBe("France");
  });
});

describe("formatFinalSummary", () => {
  it("builds a summary from a Zafronix final match", () => {
    const summary = formatFinalSummary(
      {
        stage: "final",
        homeTeam: "Argentina",
        awayTeam: "France",
        homeScore: 3,
        awayScore: 3,
      },
      "Argentina",
      (name) => resolveCountryMeta(name)?.displayName ?? name
    );

    expect(summary).toBe("Argentina ganó la final 3-3 ante Francia.");
    expect(summary).not.toContain("?");
  });

  it("parses result strings when explicit scores are missing", () => {
    const summary = formatFinalSummary(
      {
        stage: "final",
        homeTeam: "Argentina",
        awayTeam: "France",
        result: "3-3",
      },
      "Argentina",
      (name) => resolveCountryMeta(name)?.displayName ?? name
    );

    expect(summary).toBe("Argentina ganó la final 3-3 ante Francia.");
  });

  it("returns null when required fields are missing", () => {
    expect(formatFinalSummary({ stage: "final" }, "Argentina")).toBeNull();
  });
});
