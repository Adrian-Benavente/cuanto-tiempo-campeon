const { fetchBracketForYear } = require("./fetch-bracket");
const { fetchMatchesForYear } = require("./fetch-matches");
const { enrichMatchesWithBracket } = require("./fetch-world-cup-fixture");
const { fetchStandingsForYear } = require("./fetch-world-cup-standings");
const {
  buildLivePayload,
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  selectRecentMatches,
  selectUpcomingTodayMatches,
} = require("./recent-matches");

async function fetchRecentMatchesForYear(
  year,
  apiKey,
  now = new Date(),
  { timeZone = "UTC" } = {}
) {
  const [rawMatches, bracketLookup, standings] = await Promise.all([
    fetchMatchesForYear(year, apiKey),
    fetchBracketForYear(year, apiKey),
    fetchStandingsForYear(year, apiKey),
  ]);
  const matches = enrichMatchesWithBracket(rawMatches, bracketLookup, { standings });

  return buildLivePayload({
    year,
    matches: selectRecentMatches(matches, 5, now),
    upcomingToday: selectUpcomingTodayMatches(matches, now, { timeZone }),
    source: "zafronix",
  });
}

async function getRecentMatches(apiKey, now = new Date(), { timeZone = "UTC" } = {}) {
  const currentWorldCupYear = getCurrentWorldCupYear(now);

  if (!apiKey || !currentWorldCupYear) {
    return getEmptyLivePayload(now, apiKey ? "zafronix" : "fallback");
  }

  try {
    const payload = await fetchRecentMatchesForYear(
      currentWorldCupYear,
      apiKey,
      now,
      { timeZone }
    );

    if (payload.matches.length > 0 || payload.upcomingToday.length > 0) {
      return payload;
    }

    return getEmptyLivePayload(now);
  } catch (error) {
    console.error("Failed to fetch recent matches:", error);
    return getEmptyLivePayload(now);
  }
}

module.exports = {
  getRecentMatches,
  getLiveOrRecentMatches: getRecentMatches,
};
