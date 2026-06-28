const { zafronixFetch } = require("./zafronix-client");
const { getMatchScores } = require("./zafronix-normalize");
const {
  fixCrossedFeederNames,
  resolveKnockoutSideName,
} = require("./resolve-bracket-ref");

const KNOCKOUT_ROUND_ORDER = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
];

const WINNER_REF_PATTERN = /^W(\d+)$/i;

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

function parseMatchNoFromId(matchId) {
  const match = String(matchId ?? "").match(/-(\d+)$/);

  return match ? Number(match[1]) : null;
}

function getMatchNo(match) {
  if (match?.matchNo != null && !Number.isNaN(Number(match.matchNo))) {
    return Number(match.matchNo);
  }

  return parseMatchNoFromId(match?.matchId);
}

function parseWinnerRef(ref) {
  if (!ref || typeof ref !== "string") {
    return null;
  }

  const match = ref.trim().match(WINNER_REF_PATTERN);

  return match ? Number(match[1]) : null;
}

function orderRoundMatchesForTree(currentRound, nextRound) {
  if (!Array.isArray(currentRound) || !currentRound.length) {
    return currentRound;
  }

  if (!Array.isArray(nextRound) || !nextRound.length) {
    return currentRound;
  }

  const matchesByNo = new Map();

  currentRound.forEach((match) => {
    const matchNo = getMatchNo(match);

    if (matchNo != null) {
      matchesByNo.set(matchNo, match);
    }
  });

  const ordered = [];
  const used = new Set();

  nextRound.forEach((nextMatch) => {
    [nextMatch.homeRef, nextMatch.awayRef].forEach((ref) => {
      const feederNo = parseWinnerRef(ref);

      if (feederNo == null || !matchesByNo.has(feederNo) || used.has(feederNo)) {
        return;
      }

      ordered.push(matchesByNo.get(feederNo));
      used.add(feederNo);
    });
  });

  currentRound.forEach((match) => {
    const matchNo = getMatchNo(match);

    if (matchNo != null && !used.has(matchNo)) {
      ordered.push(match);
      used.add(matchNo);
    }
  });

  return ordered.length === currentRound.length ? ordered : currentRound;
}

function sortBracketRoundsForTree(rounds) {
  if (!Array.isArray(rounds) || rounds.length < 2) {
    return rounds;
  }

  for (let index = rounds.length - 2; index >= 0; index -= 1) {
    rounds[index] = {
      ...rounds[index],
      matches: orderRoundMatchesForTree(
        rounds[index].matches,
        rounds[index + 1].matches
      ),
    };
  }

  return rounds;
}

function normalizeBracketSlot(slot) {
  const matchId = slot?.matchId ?? slot?.id;

  if (!matchId) {
    return null;
  }

  const normalizedMatchId = String(matchId);

  return {
    matchId: normalizedMatchId,
    matchNo: slot?.matchNo ?? parseMatchNoFromId(normalizedMatchId),
    home: getTeamString(slot.home ?? slot.homeTeam),
    away: getTeamString(slot.away ?? slot.awayTeam),
    homeRef: slot.homeRef ?? null,
    awayRef: slot.awayRef ?? null,
  };
}

function normalizeKnockoutMatchSlot(slot, matchById, { standings, matches } = {}) {
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

  const context = { standings, matches };
  const resolvedHome = resolveKnockoutSideName({
    match: fixtureMatch,
    slot: base,
    side: "home",
    ...context,
  });
  const resolvedAway = resolveKnockoutSideName({
    match: fixtureMatch,
    slot: base,
    side: "away",
    ...context,
  });

  return {
    ...base,
    home: resolvedHome,
    away: resolvedAway,
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

function buildKnockoutBracket(payload, matches = [], standings = null) {
  const stages = payload?.stages ?? {};
  const matchById = buildMatchIdLookup(matches);
  const context = { standings, matches };
  const rounds = [];

  KNOCKOUT_ROUND_ORDER.forEach((roundId) => {
    const slots = stages[roundId];

    if (!Array.isArray(slots) || !slots.length) {
      return;
    }

    const normalizedMatches = slots
      .map((slot) => normalizeKnockoutMatchSlot(slot, matchById, context))
      .filter(Boolean);

    if (normalizedMatches.length) {
      rounds.push({
        id: roundId,
        matches: normalizedMatches,
      });
    }
  });

  for (let index = 0; index < rounds.length - 1; index += 1) {
    rounds[index] = {
      ...rounds[index],
      matches: fixCrossedFeederNames(
        rounds[index].matches,
        rounds[index + 1].matches,
        context
      ),
    };
  }

  sortBracketRoundsForTree(rounds);

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
  getMatchNo,
  normalizeBracketSlot,
  normalizeKnockoutMatchSlot,
  orderRoundMatchesForTree,
  parseWinnerRef,
  sortBracketRoundsForTree,
};
