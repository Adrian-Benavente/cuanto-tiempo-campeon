import { intervalToDuration } from "date-fns";
import { formatDurationText } from "./formatDuration";
import { getTitlesForSlug } from "./championTitles";

const CHAMPION_NAME_TO_SLUG = {
  Argentina: "argentina",
  Brazil: "brasil",
  England: "inglaterra",
  France: "francia",
  Germany: "alemania",
  Italy: "italia",
  Spain: "españa",
  Uruguay: "uruguay",
  "West Germany": "alemania",
};


function resolveChampionRecord(name, champions = []) {
  const slug = CHAMPION_NAME_TO_SLUG[name];
  const bySlug = slug ? champions.find((champion) => champion.slug === slug) : null;

  if (bySlug) {
    return bySlug;
  }

  return (
    champions.find((champion) => champion.displayName === name) ?? {
      slug: name?.toLowerCase().replace(/\s+/g, "-") ?? "unknown",
      displayName: name,
      countryCode: null,
    }
  );
}

export function getExChampions(champions = [], lastChampion) {
  if (!champions.length) {
    return [];
  }

  if (!lastChampion?.slug) {
    return champions.slice(1);
  }

  return champions.filter((champion) => champion.slug !== lastChampion.slug);
}

export function getLongestActiveDroughtSpot(
  exChampions = [],
  now = new Date(),
  locale = "es"
) {
  if (!exChampions.length) {
    return null;
  }

  const longest = exChampions.reduce((best, current) =>
    new Date(current.lastChampionDate).getTime() <
    new Date(best.lastChampionDate).getTime()
      ? current
      : best
  );
  const duration = intervalToDuration({
    start: new Date(longest.lastChampionDate),
    end: now,
  });

  return {
    id: "longestActive",
    labelKey: "spotlightLabelLongest",
    headlineKey: "spotlightLongestActive",
    champion: longest,
    vars: {
      country: longest.displayName,
      duration: formatDurationText(duration, false, locale),
    },
  };
}

export function getMostTitlesWaitingSpot(exChampions = [], aggregates = []) {
  if (!exChampions.length) {
    return null;
  }

  const leader = exChampions.reduce((best, current) => {
    const currentTitles = getTitlesForSlug(current.slug, aggregates);
    const bestTitles = getTitlesForSlug(best.slug, aggregates);
    return currentTitles > bestTitles ? current : best;
  });
  const titles = getTitlesForSlug(leader.slug, aggregates);

  return {
    id: "mostTitles",
    labelKey: "spotlightLabelStars",
    headlineKey: "spotlightMostTitles",
    champion: leader,
    vars: {
      country: leader.displayName,
      titles,
    },
  };
}

export function getClosestChallengerSpot(exChampions = [], now = new Date(), locale = "es") {
  if (!exChampions.length) {
    return null;
  }

  const challenger = exChampions[0];
  const duration = intervalToDuration({
    start: new Date(challenger.lastChampionDate),
    end: now,
  });

  return {
    id: "closestChallenger",
    labelKey: "spotlightLabelClosest",
    headlineKey: "spotlightClosestChallenger",
    champion: challenger,
    vars: {
      country: challenger.displayName,
      duration: formatDurationText(duration, false, locale),
    },
  };
}

export function getLongestEndedDroughtSpot(tournaments = [], champions = []) {
  if (!tournaments.length) {
    return null;
  }

  const sorted = [...tournaments].sort((left, right) => left.year - right.year);
  const lastWinByChampion = new Map();
  let best = null;

  sorted.forEach((tournament) => {
    const { champion, year } = tournament;

    if (!champion || !year) {
      return;
    }

    const previousYear = lastWinByChampion.get(champion);

    if (previousYear !== undefined) {
      const gapYears = year - previousYear;

      if (!best || gapYears > best.years) {
        best = {
          championName: champion,
          years: gapYears,
          fromYear: previousYear,
          toYear: year,
        };
      }
    }

    lastWinByChampion.set(champion, year);
  });

  if (!best) {
    return null;
  }

  const champion = resolveChampionRecord(best.championName, champions);

  return {
    id: "longestEnded",
    labelKey: "spotlightLabelHistoric",
    headlineKey: "spotlightLongestEnded",
    champion,
    vars: {
      country: champion.displayName,
      years: best.years,
      fromYear: best.fromYear,
      toYear: best.toYear,
    },
  };
}

export function buildWorldCupSpotlights({
  champions = [],
  lastChampion,
  aggregates = [],
  tournaments = [],
  now = new Date(),
  locale = "es",
}) {
  const exChampions = getExChampions(champions, lastChampion);

  return [
    getLongestActiveDroughtSpot(exChampions, now, locale),
    getMostTitlesWaitingSpot(exChampions, aggregates),
    getClosestChallengerSpot(exChampions, now, locale),
    getLongestEndedDroughtSpot(tournaments, champions),
  ].filter(Boolean);
}
