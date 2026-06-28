const { getMatchScores } = require("./zafronix-normalize");

const GROUP_LETTERS = "ABCDEFGHIJKL".split("");
const GROUP_POSITION_REF_PATTERN = /^(\d)([A-L])$/i;
const BEST_THIRD_REF_PATTERN = /^3([A-L]+)$/i;
const WINNER_REF_PATTERN = /^W(\d+)$/i;
const BRACKET_PLACEHOLDER_PATTERN =
  /^(?:\d+[A-L]|W\d+|L\d+|3[A-L]+)$/i;

function parseMatchNoFromId(matchId) {
  const match = String(matchId ?? "").match(/-(\d+)$/);

  return match ? Number(match[1]) : null;
}

function getMatchNo(match) {
  if (match?.matchNo != null && !Number.isNaN(Number(match.matchNo))) {
    return Number(match.matchNo);
  }

  return parseMatchNoFromId(match?.matchId ?? match?.id);
}

function parseWinnerRef(ref) {
  if (!ref || typeof ref !== "string") {
    return null;
  }

  const match = ref.trim().match(WINNER_REF_PATTERN);

  return match ? Number(match[1]) : null;
}

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

function isBracketPlaceholder(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return BRACKET_PLACEHOLDER_PATTERN.test(trimmed);
}

function parseGroupPositionRef(ref) {
  if (!ref || typeof ref !== "string") {
    return null;
  }

  const match = ref.trim().match(GROUP_POSITION_REF_PATTERN);

  if (!match) {
    return null;
  }

  return {
    position: Number(match[1]),
    group: match[2].toUpperCase(),
  };
}

function parseBestThirdRef(ref) {
  if (!ref || typeof ref !== "string") {
    return null;
  }

  const match = ref.trim().match(BEST_THIRD_REF_PATTERN);

  if (!match) {
    return null;
  }

  return match[1].toUpperCase().split("");
}

function getStandingsRow(standings, group, position) {
  const rows = standings?.groups?.[group];

  if (!Array.isArray(rows)) {
    return null;
  }

  return rows.find((row) => row?.position === position) ?? null;
}

function resolveGroupPositionRef(ref, standings) {
  const parsed = parseGroupPositionRef(ref);

  if (!parsed) {
    return null;
  }

  const row = getStandingsRow(standings, parsed.group, parsed.position);

  return row?.team ?? null;
}

function extractThirdPlaceTeams(standings, groupLetters) {
  const teams = [];

  groupLetters.forEach((letter) => {
    const row = getStandingsRow(standings, letter, 3);

    if (!row?.team) {
      return;
    }

    teams.push({
      team: row.team,
      group: letter,
      points: row.points ?? 0,
      goalDifference: row.goalDifference ?? 0,
      goalsFor: row.goalsFor ?? 0,
    });
  });

  return teams;
}

function rankBestThirdPlace(teams = []) {
  return teams.slice().sort((left, right) => {
    const comparisons = [
      (right.points ?? 0) - (left.points ?? 0),
      (right.goalDifference ?? 0) - (left.goalDifference ?? 0),
      (right.goalsFor ?? 0) - (left.goalsFor ?? 0),
    ];

    for (const comparison of comparisons) {
      if (comparison !== 0) {
        return comparison;
      }
    }

    return String(left.team).localeCompare(String(right.team));
  });
}

function resolveBestThirdRef(ref, standings) {
  const groupLetters = parseBestThirdRef(ref);

  if (!groupLetters?.length) {
    return null;
  }

  const candidates = extractThirdPlaceTeams(standings, groupLetters);

  if (!candidates.length) {
    return null;
  }

  return rankBestThirdPlace(candidates)[0]?.team ?? null;
}

function buildMatchesByNo(matches = []) {
  const lookup = new Map();

  (Array.isArray(matches) ? matches : []).forEach((match) => {
    const matchNo = getMatchNo(match);

    if (matchNo != null) {
      lookup.set(matchNo, match);
    }
  });

  return lookup;
}

function resolveWinnerMatchRef(ref, matchesByNo) {
  const matchNo = parseWinnerRef(ref);

  if (matchNo == null) {
    return null;
  }

  const match = matchesByNo.get(matchNo);

  if (!match) {
    return null;
  }

  const winner = getTeamString(match.winner);

  if (winner) {
    return winner;
  }

  const { homeScore, awayScore } = getMatchScores(match);

  if (homeScore == null || awayScore == null) {
    return null;
  }

  const home = getTeamString(match.homeTeam ?? match.home);
  const away = getTeamString(match.awayTeam ?? match.away);

  if (homeScore > awayScore) {
    return home;
  }

  if (awayScore > homeScore) {
    return away;
  }

  return null;
}

function resolveBracketRef(ref, { standings, matches } = {}) {
  if (!ref || typeof ref !== "string") {
    return null;
  }

  const trimmed = ref.trim();

  if (!trimmed) {
    return null;
  }

  const matchesByNo = buildMatchesByNo(matches);

  return (
    resolveGroupPositionRef(trimmed, standings) ??
    resolveBestThirdRef(trimmed, standings) ??
    resolveWinnerMatchRef(trimmed, matchesByNo)
  );
}

function resolveKnockoutSideName({
  match,
  slot,
  side,
  standings,
  matches,
}) {
  const refKey = side === "home" ? "homeRef" : "awayRef";
  const nameKey = side === "home" ? "home" : "away";
  const teamKey = side === "home" ? "homeTeam" : "awayTeam";
  const ref = slot?.[refKey] ?? match?.[refKey];

  const fromRef = resolveBracketRef(ref, { standings, matches });

  if (fromRef) {
    return fromRef;
  }

  const slotName = getTeamString(slot?.[nameKey]);
  const matchName = getTeamString(match?.[teamKey] ?? match?.[nameKey]);

  if (slotName && !isBracketPlaceholder(slotName)) {
    return slotName;
  }

  if (matchName && !isBracketPlaceholder(matchName)) {
    return matchName;
  }

  return null;
}

module.exports = {
  GROUP_LETTERS,
  buildMatchesByNo,
  isBracketPlaceholder,
  parseBestThirdRef,
  parseGroupPositionRef,
  resolveBestThirdRef,
  resolveBracketRef,
  resolveGroupPositionRef,
  resolveKnockoutSideName,
  resolveWinnerMatchRef,
};
