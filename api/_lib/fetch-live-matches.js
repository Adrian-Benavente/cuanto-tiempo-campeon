const { zafronixFetch } = require("./zafronix-client");
const {
  getFallbackRecentMatches,
  getRecentTournamentYears,
  selectRecentMatches,
} = require("./recent-matches");

async function fetchRecentMatchesForYear(year, apiKey) {
  const payload = await zafronixFetch(`/matches?year=${year}`, apiKey);
  const matches = payload?.matches ?? payload ?? [];

  return {
    year,
    matches: selectRecentMatches(matches),
  };
}

async function getRecentMatches(apiKey) {
  if (!apiKey) {
    return getFallbackRecentMatches(2022);
  }

  try {
    const candidateYears = getRecentTournamentYears();

    for (const year of candidateYears) {
      const { matches } = await fetchRecentMatchesForYear(year, apiKey);

      if (matches.length > 0) {
        return {
          mode: "recent",
          year,
          matches,
          source: "zafronix",
        };
      }
    }

    return getFallbackRecentMatches(2022);
  } catch (error) {
    console.error("Failed to fetch recent matches:", error);
    return getFallbackRecentMatches(2022);
  }
}

async function getLiveOrRecentMatches(apiKey) {
  if (!apiKey) {
    return getRecentMatches(apiKey);
  }

  try {
    const payload = await zafronixFetch("/matches/live", apiKey);
    const matches = payload?.matches ?? payload ?? [];
    const liveMatches = Array.isArray(matches) ? matches.slice(0, 5) : [];

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
