const { zafronixFetch } = require("./zafronix-client");

function getTeamString(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  return value.name ?? value.displayName ?? value.shortName ?? null;
}

function normalizeBracketSlot(slot) {
  const matchId = slot?.matchId ?? slot?.id;

  if (!matchId) {
    return null;
  }

  return {
    matchId: String(matchId),
    home: getTeamString(slot.home ?? slot.homeTeam),
    away: getTeamString(slot.away ?? slot.awayTeam),
    homeRef: slot.homeRef ?? null,
    awayRef: slot.awayRef ?? null,
  };
}

function buildBracketLookup(payload) {
  const lookup = new Map();
  const stages = payload?.stages ?? {};

  Object.values(stages).forEach((slots) => {
    if (!Array.isArray(slots)) {
      return;
    }

    slots.forEach((slot) => {
      const normalized = normalizeBracketSlot(slot);

      if (normalized) {
        lookup.set(normalized.matchId, normalized);
      }
    });
  });

  return lookup;
}

async function fetchBracketForYear(year, apiKey) {
  if (!apiKey || !year) {
    return new Map();
  }

  try {
    const payload = await zafronixFetch(`/bracket?year=${year}`, apiKey);
    return buildBracketLookup(payload);
  } catch (error) {
    console.error("Failed to fetch bracket:", error);
    return new Map();
  }
}

module.exports = {
  buildBracketLookup,
  fetchBracketForYear,
  normalizeBracketSlot,
};
