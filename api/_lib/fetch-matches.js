const { zafronixFetch } = require("./zafronix-client");
const { extractMatches } = require("./zafronix-normalize");

const MATCHES_CACHE_TTL_MS = 5 * 60 * 1000;
const matchesYearCache = new Map();

async function fetchMatchesForYear(year, apiKey) {
  const cacheKey = String(year);
  const cached = matchesYearCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < MATCHES_CACHE_TTL_MS) {
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
  fetchMatchesForYear,
};
