import { getTitlesForSlug } from "./championTitles";
import { fallbackChampions } from "../api/world-champions-fallback";
import {
  buildWorldCupSpotlights,
  getClosestChallengerSpot,
  getExChampions,
  getLongestActiveDroughtSpot,
  getLongestEndedDroughtSpot,
  getMostTitlesWaitingSpot,
} from "./worldCupSpotlight";

const aggregates = [
  { slug: "brasil", titles: 5 },
  { slug: "alemania", titles: 4 },
  { slug: "italia", titles: 4 },
  { slug: "argentina", titles: 3 },
  { slug: "francia", titles: 2 },
  { slug: "uruguay", titles: 2 },
  { slug: "inglaterra", titles: 1 },
  { slug: "españa", titles: 1 },
];

const tournaments = [
  { year: 1934, champion: "Italy" },
  { year: 1938, champion: "Italy" },
  { year: 1982, champion: "Italy" },
  { year: 2006, champion: "Italy" },
  { year: 1966, champion: "England" },
  { year: 2018, champion: "France" },
  { year: 2022, champion: "Argentina" },
];

const fixedNow = new Date("2026-06-01T12:00:00.000Z");
const lastChampion = fallbackChampions[0];
const exChampions = getExChampions(fallbackChampions, lastChampion);

describe("getExChampions", () => {
  it("excludes the current champion", () => {
    expect(exChampions.map((champion) => champion.slug)).not.toContain("argentina");
    expect(exChampions).toHaveLength(fallbackChampions.length - 1);
  });
});

describe("spotlight insights", () => {
  it("picks the longest active drought among former champions", () => {
    const spot = getLongestActiveDroughtSpot(exChampions, fixedNow, "es");

    expect(spot.champion.slug).toBe("uruguay");
    expect(spot.vars.country).toBe("Uruguay");
    expect(spot.headlineKey).toBe("spotlightLongestActive");
  });

  it("picks the most decorated former champion still waiting", () => {
    const spot = getMostTitlesWaitingSpot(exChampions, aggregates);

    expect(spot.champion.slug).toBe("brasil");
    expect(spot.vars.titles).toBe(5);
  });

  it("falls back to known title counts when aggregates are missing", () => {
    const spot = getMostTitlesWaitingSpot(exChampions, []);

    expect(spot.champion.slug).toBe("brasil");
    expect(spot.vars.titles).toBe(5);
  });

  it("resolves France with two titles from fallback data", () => {
    expect(getTitlesForSlug("francia", [])).toBe(2);
  });

  it("picks the most recent former champion as closest challenger", () => {
    const spot = getClosestChallengerSpot(exChampions, fixedNow, "es");

    expect(spot.champion.slug).toBe("francia");
    expect(spot.vars.country).toBe("Francia");
  });

  it("finds the longest drought that eventually ended", () => {
    const spot = getLongestEndedDroughtSpot(tournaments, fallbackChampions);

    expect(spot.vars.country).toBe("Italia");
    expect(spot.vars.years).toBe(44);
    expect(spot.vars.fromYear).toBe(1938);
    expect(spot.vars.toYear).toBe(1982);
  });
});

describe("buildWorldCupSpotlights", () => {
  it("returns four curated spotlight cards", () => {
    const spots = buildWorldCupSpotlights({
      champions: fallbackChampions,
      lastChampion,
      aggregates,
      tournaments,
      now: fixedNow,
      locale: "es",
    });

    expect(spots).toHaveLength(4);
    expect(spots.map((spot) => spot.id)).toEqual([
      "longestActive",
      "mostTitles",
      "closestChallenger",
      "longestEnded",
    ]);
  });
});
