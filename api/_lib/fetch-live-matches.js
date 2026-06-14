const { fetchMatchesForYear } = require("./fetch-matches");
const {
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  selectLiveMatches,
  selectRecentMatches,
} = require("./recent-matches");
const { extractMatches } = require("./zafronix-normalize");
const { zafronixFetch } = require("./zafronix-client");

function isZafronixProOnlyError(error) {
  const message = String(error?.message ?? "");
  return message.includes("(402)") || message.includes("live_data_is_pro");
}

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

async function getLiveMatchesFromYear(apiKey, now = new Date()) {
  const year = getCurrentWorldCupYear(now);

  if (!year) {
    return null;
  }

  try {
    const matches = await fetchMatchesForYear(year, apiKey);
    const liveMatches = selectLiveMatches(matches, 5, now);

    if (liveMatches.length === 0) {
      return null;
    }

    return {
      mode: "live",
      year,
      matches: liveMatches,
      source: "zafronix",
      liveSource: "year",
    };
  } catch (error) {
    console.error("Failed to detect live matches from year fixture:", error);
    return null;
  }
}

async function getLiveOrRecentMatches(apiKey, now = new Date()) {
  if (!apiKey) {
    return getEmptyLivePayload(now, "fallback");
  }

  try {
    const payload = await zafronixFetch("/matches/live", apiKey);
    const matches = extractMatches(payload);
    const liveMatches = matches.slice(0, 5);

    if (liveMatches.length > 0) {
      return {
        mode: "live",
        year: now.getUTCFullYear(),
        matches: liveMatches,
        source: "zafronix",
      };
    }
  } catch (error) {
    if (isZafronixProOnlyError(error)) {
      console.info(
        "Live endpoint requires Pro+ plan; detecting in-progress matches from year fixture"
      );
    } else {
      console.error("Failed to fetch live matches:", error);
    }
  }

  const yearLive = await getLiveMatchesFromYear(apiKey, now);

  if (yearLive) {
    return yearLive;
  }

  return getRecentMatches(apiKey, now);
}

module.exports = {
  getLiveMatchesFromYear,
  getLiveOrRecentMatches,
  getLiveMatches: getLiveOrRecentMatches,
  isZafronixProOnlyError,
};
