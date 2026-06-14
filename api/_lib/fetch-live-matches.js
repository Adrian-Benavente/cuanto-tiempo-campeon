const { fetchMatchesForYear } = require("./fetch-matches");
const {
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  selectRecentMatches,
} = require("./recent-matches");

async function fetchRecentMatchesForYear(year, apiKey, now = new Date()) {
  const matches = await fetchMatchesForYear(year, apiKey);

  return {
    year,
    matches: selectRecentMatches(matches, 5, now),
  };
}

async function getRecentMatches(apiKey, now = new Date()) {
  const currentWorldCupYear = getCurrentWorldCupYear(now);

  if (!apiKey || !currentWorldCupYear) {
    return getEmptyLivePayload(now, apiKey ? "zafronix" : "fallback");
  }

  try {
    const { year, matches } = await fetchRecentMatchesForYear(
      currentWorldCupYear,
      apiKey,
      now
    );

    if (matches.length > 0) {
      return {
        mode: "recent",
        year,
        matches,
        source: "zafronix",
      };
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
