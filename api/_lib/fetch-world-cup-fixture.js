const { fetchMatchesForYear } = require("./fetch-matches");
const { getCurrentWorldCupYear, getMatchDate } = require("./recent-matches");

const TOURNAMENT_START = new Date("2026-06-11T16:00:00.000Z");
const TOURNAMENT_END = new Date("2026-07-19T18:00:00.000Z");

const FIXTURE_CACHE_DURING =
  "public, s-maxage=3600, stale-while-revalidate=86400";
const FIXTURE_CACHE_PRE =
  "public, s-maxage=86400, stale-while-revalidate=604800";

function sortMatchesChronologically(matches) {
  return (Array.isArray(matches) ? matches : []).slice().sort((left, right) => {
    const dateDiff = getMatchDate(left) - getMatchDate(right);

    if (dateDiff !== 0) {
      return dateDiff;
    }

    const kickoffLeft = left?.kickoff ?? "";
    const kickoffRight = right?.kickoff ?? "";

    return String(kickoffLeft).localeCompare(String(kickoffRight));
  });
}

function getFixtureCacheControl(now = new Date()) {
  if (now >= TOURNAMENT_START && now <= TOURNAMENT_END) {
    return FIXTURE_CACHE_DURING;
  }

  return FIXTURE_CACHE_PRE;
}

function getEmptyFixturePayload(now = new Date(), source = "fallback") {
  return {
    year: getCurrentWorldCupYear(now),
    matches: [],
    source,
  };
}

async function getWorldCupFixture(apiKey, now = new Date()) {
  const year = getCurrentWorldCupYear(now);

  if (!year) {
    return getEmptyFixturePayload(now, apiKey ? "zafronix" : "fallback");
  }

  if (!apiKey) {
    return {
      year,
      matches: [],
      source: "fallback",
    };
  }

  try {
    const matches = await fetchMatchesForYear(year, apiKey);

    return {
      year,
      matches: sortMatchesChronologically(matches),
      source: "zafronix",
    };
  } catch (error) {
    console.error("Failed to fetch world cup fixture:", error);

    return {
      year,
      matches: [],
      source: "fallback",
    };
  }
}

module.exports = {
  FIXTURE_CACHE_DURING,
  FIXTURE_CACHE_PRE,
  getEmptyFixturePayload,
  getFixtureCacheControl,
  getWorldCupFixture,
  sortMatchesChronologically,
};
