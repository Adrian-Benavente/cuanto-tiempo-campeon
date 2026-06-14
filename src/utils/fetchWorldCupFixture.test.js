const {
  getFixtureCacheControl,
  sortMatchesChronologically,
} = require("../../api/_lib/fetch-world-cup-fixture");

describe("sortMatchesChronologically", () => {
  it("sorts by date ascending and kickoff as tiebreaker", () => {
    const matches = [
      { id: "late", date: "2026-06-12", kickoff: "20:00" },
      { id: "early", date: "2026-06-11", kickoff: "18:00" },
      { id: "same-day-late", date: "2026-06-11", kickoff: "21:00" },
      { id: "same-day-early", date: "2026-06-11", kickoff: "15:00" },
    ];

    expect(sortMatchesChronologically(matches).map((match) => match.id)).toEqual([
      "same-day-early",
      "early",
      "same-day-late",
      "late",
    ]);
  });
});

describe("getFixtureCacheControl", () => {
  it("uses shorter cache during the tournament", () => {
    expect(getFixtureCacheControl(new Date("2026-06-20T12:00:00.000Z"))).toContain(
      "s-maxage=21600"
    );
  });

  it("uses longer cache before the tournament", () => {
    expect(getFixtureCacheControl(new Date("2026-03-01T12:00:00.000Z"))).toContain(
      "s-maxage=86400"
    );
  });
});
