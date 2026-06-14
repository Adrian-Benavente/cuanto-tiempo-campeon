const { fetchMatchesForYear } = require("./fetch-matches");
const {
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  selectRecentMatches,
} = require("./recent-matches");
const { extractMatches } = require("./zafronix-normalize");
const { zafronixFetch } = require("./zafronix-client");

async function fetchRecentMatchesForYear(year, apiKey) {
  const matches = await fetchMatchesForYear(year, apiKey);

  return {
    year,
    matches: selectRecentMatches(matches),
  };
}

async function getRecentMatches(apiKey) {
  const currentWorldCupYear = getCurrentWorldCupYear();

  if (!apiKey || !currentWorldCupYear) {
    return getEmptyLivePayload(new Date(), apiKey ? "zafronix" : "fallback");
  }

  try {
    const { year, matches } = await fetchRecentMatchesForYear(
      currentWorldCupYear,
      apiKey
    );

    if (matches.length > 0) {
      return {
        mode: "recent",
        year,
        matches,
        source: "zafronix",
      };
    }

    return getEmptyLivePayload();
  } catch (error) {
    console.error("Failed to fetch recent matches:", error);
    return getEmptyLivePayload();
  }
}

async function getLiveOrRecentMatches(apiKey) {
  if (!apiKey) {
    return getEmptyLivePayload(new Date(), "fallback");
  }

  try {
    const payload = await zafronixFetch("/matches/live", apiKey);
    const matches = extractMatches(payload);
    const liveMatches = matches.slice(0, 5);

    if (liveMatches.length > 0) {
      return {
        mode: "live",
        year: new Date().getUTCFullYear(),
        matches: liveMatches,
        source: "zafronix",
      };
    }

    return getRecentMatches(apiKey);
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    return getRecentMatches(apiKey);
  }
}

module.exports = {
  getLiveOrRecentMatches,
  getLiveMatches: getLiveOrRecentMatches,
};
