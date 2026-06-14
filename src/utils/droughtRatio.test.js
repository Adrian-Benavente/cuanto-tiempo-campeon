import {
  getDroughtMs,
  getDroughtRatio,
  getMaxDroughtMs,
} from "./droughtRatio";

describe("droughtRatio", () => {
  const now = new Date("2024-01-01T00:00:00.000Z");
  const champions = [
    { lastChampionDate: "2022-12-18T18:00:00.000Z" },
    { lastChampionDate: "1950-07-16T18:00:00.000Z" },
  ];

  test("computes drought milliseconds", () => {
    expect(getDroughtMs("2022-12-18T18:00:00.000Z", now)).toBeGreaterThan(0);
  });

  test("normalizes drought ratio against max", () => {
    const maxMs = getMaxDroughtMs(champions, now);
    const ratio = getDroughtRatio(champions[1].lastChampionDate, maxMs, now);

    expect(ratio).toBe(1);
  });
});
