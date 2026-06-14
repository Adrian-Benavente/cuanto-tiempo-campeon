const { fetchMatchesByIds } = require("./fetch-match-by-id");
const {
  DEFAULT_MATCHES_CACHE_TTL_MS,
  fetchMatchesForYear,
} = require("./fetch-matches");
const { enrichMatchScores } = require("./match-scores");
const {
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  selectLiveMatches,
  selectRecentMatches,
} = require("./recent-matches");
const { extractMatches } = require("./zafronix-normalize");
const { zafronixFetch } = require("./zafronix-client");

const LIVE_MATCHES_CACHE_TTL_MS = 60 * 1000;

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

async function enrichLiveMatches(matches, apiKey, now = new Date()) {
  const matchIds = matches.map((match) => match.id).filter(Boolean);
  const refreshedMatches = matchIds.length
    ? await fetchMatchesByIds(matchIds, apiKey)
    : [];

  const refreshedById = new Map(
    refreshedMatches
      .filter(Boolean)
      .map((match) => [match.id, match])
  );

  return matches.map((match) => {
    const refreshed = refreshedById.get(match.id) ?? match;
    return enrichMatchScores(refreshed, now);
  });
}

async function getLiveMatchesFromYear(apiKey, now = new Date()) {
  const year = getCurrentWorldCupYear(now);

  if (!year) {
    return null;
  }

  try {
    const matches = await fetchMatchesForYear(year, apiKey, {
      cacheTtlMs: LIVE_MATCHES_CACHE_TTL_MS,
    });
    const liveMatches = selectLiveMatches(matches, 5, now);

    if (liveMatches.length === 0) {
      return null;
    }

    const enrichedMatches = await enrichLiveMatches(liveMatches, apiKey, now);

    return {
      mode: "live",
      year,
      matches: enrichedMatches,
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
      const enrichedMatches = await enrichLiveMatches(liveMatches, apiKey, now);

      return {
        mode: "live",
        year: now.getUTCFullYear(),
        matches: enrichedMatches,
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
  enrichLiveMatches,
  getLiveMatchesFromYear,
  getLiveOrRecentMatches,
  getLiveMatches: getLiveOrRecentMatches,
  isZafronixProOnlyError,
  LIVE_MATCHES_CACHE_TTL_MS,
};
