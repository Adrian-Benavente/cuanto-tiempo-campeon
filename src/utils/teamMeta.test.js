import {
  getFifaThreeLetterCode,
  resolveBracketTeam,
  resolveTeamMeta,
} from "./teamMeta";

describe("resolveTeamMeta", () => {
  it("resolves known Zafronix team names", () => {
    expect(resolveTeamMeta("Mexico")?.slug).toBe("mexico");
    expect(resolveTeamMeta("Argentina")?.countryCode).toBe("AR");
    expect(resolveTeamMeta("England")?.slug).toBe("inglaterra");
  });

  it("resolves extra 2026 participants", () => {
    expect(resolveTeamMeta("South Africa")?.countryCode).toBe("ZA");
    expect(resolveTeamMeta("Côte d'Ivoire")?.slug).toBe("costa-de-marfil");
  });
});

describe("getFifaThreeLetterCode", () => {
  it("returns FIFA overrides for special cases", () => {
    expect(getFifaThreeLetterCode(resolveTeamMeta("United States"), "United States")).toBe(
      "USA"
    );
    expect(getFifaThreeLetterCode(resolveTeamMeta("England"), "England")).toBe("ENG");
    expect(getFifaThreeLetterCode(resolveTeamMeta("South Korea"), "South Korea")).toBe(
      "KOR"
    );
    expect(getFifaThreeLetterCode(resolveTeamMeta("Iran"), "Iran")).toBe("IRN");
  });

  it("falls back to the first three letters of the API name", () => {
    expect(getFifaThreeLetterCode(null, "Atlantis")).toBe("ATL");
  });
});

describe("resolveBracketTeam", () => {
  it("marks empty slots as TBD", () => {
    expect(resolveBracketTeam(null)).toEqual({
      isTbd: true,
      apiName: null,
      meta: null,
      fifaCode: null,
    });
  });

  it("resolves known teams with FIFA codes", () => {
    const team = resolveBracketTeam("Brazil");

    expect(team.isTbd).toBe(false);
    expect(team.fifaCode).toBe("BRA");
    expect(team.meta?.slug).toBe("brasil");
  });
});
