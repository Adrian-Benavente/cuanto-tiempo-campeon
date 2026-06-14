const { zafronixFetch } = require("./zafronix-client");

const MATCH_BY_ID_CACHE_TTL_MS = 60 * 1000;
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

async function fetchMatchById(matchId, apiKey) {
  if (!matchId || !apiKey) {
    return null;
  }

  const cacheKey = String(matchId);
  const cached = matchByIdCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < MATCH_BY_ID_CACHE_TTL_MS) {
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

async function fetchMatchesByIds(matchIds, apiKey) {
  const ids = Array.isArray(matchIds) ? matchIds.filter(Boolean) : [];

  if (ids.length === 0) {
    return [];
  }

  const matches = await Promise.all(
    ids.map(async (matchId) => {
      try {
        return await fetchMatchById(matchId, apiKey);
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
  extractMatch,
  fetchMatchById,
  fetchMatchesByIds,
  MATCH_BY_ID_CACHE_TTL_MS,
};
