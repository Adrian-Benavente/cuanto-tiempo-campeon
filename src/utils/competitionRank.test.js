import {
  assignCompetitionRanks,
  compareByTitlesThenRecency,
} from "./competitionRank";

describe("compareByTitlesThenRecency", () => {
  it("breaks title ties by most recent championship", () => {
    const germany = {
      slug: "alemania",
      titles: 4,
      lastChampionDate: "2014-07-13T18:00:00.000Z",
    };
    const italy = {
      slug: "italia",
      titles: 4,
      lastChampionDate: "2006-07-09T18:00:00.000Z",
    };

    expect(compareByTitlesThenRecency(germany, italy)).toBeLessThan(0);
    expect(compareByTitlesThenRecency(italy, germany)).toBeGreaterThan(0);
  });
});

describe("assignCompetitionRanks", () => {
  it("assigns competition-style ranks for tied groups", () => {
    const items = [
      { name: "Brasil", titles: 5 },
      { name: "Alemania", titles: 4 },
      { name: "Italia", titles: 4 },
      { name: "Argentina", titles: 3 },
    ];

    const ranked = assignCompetitionRanks(items, (item) => item.titles);

    expect(ranked.map((item) => item.displayRank)).toEqual([1, 2, 2, 4]);
  });

  it("keeps the first rank when all values tie", () => {
    const items = [{ titles: 2 }, { titles: 2 }, { titles: 2 }];

    expect(
      assignCompetitionRanks(items, (item) => item.titles).map(
        (item) => item.displayRank
      )
    ).toEqual([1, 1, 1]);
  });
});
