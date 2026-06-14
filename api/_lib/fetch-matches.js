const { zafronixFetch } = require("./zafronix-client");
const { extractMatches } = require("./zafronix-normalize");

const DEFAULT_MATCHES_CACHE_TTL_MS = 5 * 60 * 1000;
const matchesYearCache = new Map();

async function fetchMatchesForYear(
  year,
  apiKey,
  { cacheTtlMs = DEFAULT_MATCHES_CACHE_TTL_MS } = {}
) {
  const cacheKey = `${year}:${cacheTtlMs}`;
  const cached = matchesYearCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < cacheTtlMs) {
    return cached.matches;
  }

  const payload = await zafronixFetch(`/matches?year=${year}`, apiKey);
  const matches = extractMatches(payload);

  matchesYearCache.set(cacheKey, {
    matches,
    fetchedAt: now,
  });

  return matches;
}

function clearMatchesYearCache() {
  matchesYearCache.clear();
}

module.exports = {
  clearMatchesYearCache,
  DEFAULT_MATCHES_CACHE_TTL_MS,
  fetchMatchesForYear,
};
