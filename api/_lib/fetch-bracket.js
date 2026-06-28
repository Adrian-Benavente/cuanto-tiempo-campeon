const { zafronixFetch } = require("./zafronix-client");
const { getMatchScores } = require("./zafronix-normalize");

const KNOCKOUT_ROUND_ORDER = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
];

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

function getMatchIdFromSlot(slot) {
  return String(slot?.matchId ?? slot?.id ?? "");
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

function normalizeKnockoutMatchSlot(slot, matchById) {
  const base = normalizeBracketSlot(slot);

  if (!base) {
    return null;
  }

  const bracketHomeScore = slot?.homeScore ?? null;
  const bracketAwayScore = slot?.awayScore ?? null;
  const bracketWinner = getTeamString(slot?.winner);

  const fixtureMatch = matchById.get(base.matchId);
  const fixtureScores = fixtureMatch ? getMatchScores(fixtureMatch) : {};
  const fixtureWinner = getTeamString(fixtureMatch?.winner);

  const homeScore =
    bracketHomeScore != null ? bracketHomeScore : fixtureScores.homeScore ?? null;
  const awayScore =
    bracketAwayScore != null ? bracketAwayScore : fixtureScores.awayScore ?? null;
  const winner = bracketWinner ?? fixtureWinner ?? null;

  return {
    ...base,
    homeScore,
    awayScore,
    winner,
  };
}

function buildMatchIdLookup(matches = []) {
  const lookup = new Map();

  (Array.isArray(matches) ? matches : []).forEach((match) => {
    const matchId = getMatchIdFromSlot(match);

    if (matchId) {
      lookup.set(matchId, match);
    }
  });

  return lookup;
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

function buildKnockoutBracket(payload, matches = []) {
  const stages = payload?.stages ?? {};
  const matchById = buildMatchIdLookup(matches);
  const rounds = [];

  KNOCKOUT_ROUND_ORDER.forEach((roundId) => {
    const slots = stages[roundId];

    if (!Array.isArray(slots) || !slots.length) {
      return;
    }

    const normalizedMatches = slots
      .map((slot) => normalizeKnockoutMatchSlot(slot, matchById))
      .filter(Boolean);

    if (normalizedMatches.length) {
      rounds.push({
        id: roundId,
        matches: normalizedMatches,
      });
    }
  });

  return {
    year: payload?.year ?? null,
    rounds,
  };
}

function getEmptyKnockoutBracket(year = null) {
  return {
    year,
    rounds: [],
  };
}

async function fetchBracketPayload(year, apiKey) {
  if (!apiKey || !year) {
    return null;
  }

  try {
    return await zafronixFetch(`/bracket?year=${year}`, apiKey);
  } catch (error) {
    console.error("Failed to fetch bracket:", error);
    return null;
  }
}

async function fetchBracketForYear(year, apiKey) {
  const payload = await fetchBracketPayload(year, apiKey);

  if (!payload) {
    return new Map();
  }

  return buildBracketLookup(payload);
}

module.exports = {
  KNOCKOUT_ROUND_ORDER,
  buildBracketLookup,
  buildKnockoutBracket,
  fetchBracketForYear,
  fetchBracketPayload,
  getEmptyKnockoutBracket,
  normalizeBracketSlot,
  normalizeKnockoutMatchSlot,
};
