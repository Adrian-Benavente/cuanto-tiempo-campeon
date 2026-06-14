const { zafronixFetch } = require("./zafronix-client");

const DEFAULT_MATCH_BY_ID_CACHE_TTL_MS = 60 * 1000;
const matchByIdCache = new Map();

function extractMatch(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.id) {
    return payload;
  }

  return payload?.data ?? payload?.match ?? null;
}

async function fetchMatchById(
  matchId,
  apiKey,
  { cacheTtlMs = DEFAULT_MATCH_BY_ID_CACHE_TTL_MS } = {}
) {
  if (!matchId || !apiKey) {
    return null;
  }

  const cacheKey = `${matchId}:${cacheTtlMs}`;
  const cached = matchByIdCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < cacheTtlMs) {
    return cached.match;
  }

  const payload = await zafronixFetch(`/matches/${matchId}`, apiKey);
  const match = extractMatch(payload);

  if (match) {
    matchByIdCache.set(cacheKey, {
      match,
      fetchedAt: now,
    });
  }

  return match;
}

async function fetchMatchesByIds(
  matchIds,
  apiKey,
  { cacheTtlMs = DEFAULT_MATCH_BY_ID_CACHE_TTL_MS } = {}
) {
  const ids = Array.isArray(matchIds) ? matchIds.filter(Boolean) : [];

  if (ids.length === 0) {
    return [];
  }

  const matches = await Promise.all(
    ids.map(async (matchId) => {
      try {
        return await fetchMatchById(matchId, apiKey, { cacheTtlMs });
      } catch (error) {
        console.error(`Failed to fetch match ${matchId}:`, error);
        return null;
      }
    })
  );

  return matches.filter(Boolean);
}

function clearMatchByIdCache() {
  matchByIdCache.clear();
}

module.exports = {
  clearMatchByIdCache,
  DEFAULT_MATCH_BY_ID_CACHE_TTL_MS,
  extractMatch,
  fetchMatchById,
  fetchMatchesByIds,
};
