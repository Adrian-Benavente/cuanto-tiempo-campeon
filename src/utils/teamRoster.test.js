const {
  getZafronixTeamName,
} = require("../../api/_lib/country-meta");
const {
  normalizeRoster,
  normalizeRosterPlayer,
} = require("../../api/_lib/fetch-team-roster");

describe("getZafronixTeamName", () => {
  it("maps champion slugs to Zafronix API names", () => {
    expect(getZafronixTeamName("francia")).toBe("France");
    expect(getZafronixTeamName("españa")).toBe("Spain");
    expect(getZafronixTeamName("alemania")).toBe("Germany");
    expect(getZafronixTeamName("argentina")).toBe("Argentina");
  });

  it("maps never-won team slugs to Zafronix API names", () => {
    expect(getZafronixTeamName("mexico")).toBe("Mexico");
    expect(getZafronixTeamName("holanda")).toBe("Netherlands");
    expect(getZafronixTeamName("usa")).toBe("United States");
  });
});

describe("normalizeRosterPlayer", () => {
  it("normalizes roster rows from Zafronix", () => {
    expect(
      normalizeRosterPlayer({
        jersey: 10,
        name: "Lionel Messi",
        position: "FW",
        goals: 2,
        captain: true,
        club: { name: "Inter Miami", country: "United States" },
      })
    ).toEqual({
      jersey: 10,
      name: "Lionel Messi",
      position: "FW",
      goals: 2,
      captain: true,
      club: "Inter Miami",
    });
  });
});

describe("normalizeRoster", () => {
  it("sorts players by jersey number", () => {
    const players = normalizeRoster([
      { jersey: 9, name: "Striker", position: "FW" },
      { jersey: 1, name: "Keeper", position: "GK" },
    ]);

    expect(players.map((player) => player.jersey)).toEqual([1, 9]);
  });
});
