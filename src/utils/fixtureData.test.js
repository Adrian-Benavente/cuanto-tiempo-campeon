import { groupMatchesByStage } from "./fixtureData";
import {
  getMatchSideDisplayName,
  getMatchSideRawName,
  isBracketPlaceholder,
} from "./matchTeams";

describe("isBracketPlaceholder", () => {
  it("detects FIFA bracket codes", () => {
    expect(isBracketPlaceholder("1A")).toBe(true);
    expect(isBracketPlaceholder("W73")).toBe(true);
    expect(isBracketPlaceholder("3ABCDF")).toBe(true);
    expect(isBracketPlaceholder("Argentina")).toBe(false);
  });
});

describe("getMatchSideDisplayName", () => {
  it("returns TBD for bracket placeholders", () => {
    const match = { homeTeam: "1A", awayTeam: "Argentina" };

    expect(getMatchSideDisplayName(match, "home", "Por definir")).toEqual({
      name: "Por definir",
      isPlaceholder: true,
    });
    expect(getMatchSideDisplayName(match, "away", "Por definir")).toEqual({
      name: "Argentina",
      isPlaceholder: false,
    });
  });

  it("shows TBD when only bracket refs are available", () => {
    const match = { homeRef: "W73", awayTeam: "Brasil" };

    expect(getMatchSideRawName(match, "home")).toBe("");
    expect(getMatchSideDisplayName(match, "home", "TBD").isPlaceholder).toBe(true);
    expect(getMatchSideDisplayName(match, "away", "TBD").isPlaceholder).toBe(false);
  });

  it("prefers resolved team names over bracket refs", () => {
    const match = {
      homeTeam: "Mexico",
      awayTeam: "Brazil",
      homeRef: "2A",
      awayRef: "2B",
    };

    expect(getMatchSideDisplayName(match, "home", "Por definir")).toEqual({
      name: "Mexico",
      isPlaceholder: false,
    });
    expect(getMatchSideDisplayName(match, "away", "Por definir")).toEqual({
      name: "Brazil",
      isPlaceholder: false,
    });
  });
});

describe("groupMatchesByStage", () => {
  it("groups and orders stages from groups through final", () => {
    const matches = [
      { id: "final", stage: "final", date: "2026-07-19" },
      { id: "ga-1", stage: "group_a", date: "2026-06-11" },
      { id: "qf-1", stage: "quarter_final", date: "2026-07-04" },
      { id: "gb-1", stage: "group_b", date: "2026-06-12" },
    ];

    const sections = groupMatchesByStage(matches, "es");

    expect(sections.map((section) => section.stageKey)).toEqual([
      "group_a",
      "group_b",
      "quarter_final",
      "final",
    ]);
    expect(sections[0].label).toBe("Grupo A");
    expect(sections[2].label).toBe("Cuartos de final");
  });
});
