import {
  formatMatchStage,
  formatMatchStageFromMatch,
  getMatchStageRaw,
} from "./formatMatchStage";

describe("formatMatchStage", () => {
  it("formats group stages with letters", () => {
    expect(formatMatchStage("group_c", "es")).toBe("Grupo C");
    expect(formatMatchStage("group_a", "en")).toBe("Group A");
  });

  it("formats group stages with numbers", () => {
    expect(formatMatchStage("group_3", "es")).toBe("Grupo 3");
  });

  it("formats knockout stages", () => {
    expect(formatMatchStage("quarter_final", "es")).toBe("Cuartos de final");
    expect(formatMatchStage("qf", "en")).toBe("Quarter-finals");
    expect(formatMatchStage("semi_final", "es")).toBe("Semifinal");
    expect(formatMatchStage("final", "en")).toBe("Final");
    expect(formatMatchStage("third_place", "es")).toBe("Tercer puesto");
    expect(formatMatchStage("round_of_16", "en")).toBe("Round of 16");
    expect(formatMatchStage("r32", "es")).toBe("Dieciseisavos de final");
  });

  it("humanizes unknown snake_case stages", () => {
    expect(formatMatchStage("playoff_round", "es")).toBe("Playoff Round");
  });

  it("prefers stageNormalized from match payload", () => {
    expect(
      getMatchStageRaw({ stage: "group_c", stageNormalized: "group_c" })
    ).toBe("group_c");
    expect(
      formatMatchStageFromMatch(
        { stage: "qf", stageNormalized: "quarter_final" },
        "es"
      )
    ).toBe("Cuartos de final");
  });
});
