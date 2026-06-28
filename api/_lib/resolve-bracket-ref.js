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

function getStandingsRows(standings, group) {
  const rows = standings?.groups?.[group];

  return Array.isArray(rows) ? rows : [];
}

function hasStandingsActivityForGroup(standings, group) {
  return getStandingsRows(standings, group).some(
    (row) => (row?.played ?? 0) > 0 || (row?.points ?? 0) > 0
  );
}

function getStandingsRow(standings, group, position) {
  const rows = getStandingsRows(standings, group);

  return (
    rows.find((row) => Number(row?.position) === Number(position)) ?? null
  );
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
    resolveWinnerMatchRef(trimmed, matchesByNo)
  );
}

function setSideName(match, side, name) {
  if (side === "home") {
    match.home = name;
    match.homeTeam = name;
  } else {
    match.away = name;
    match.awayTeam = name;
  }
}

function getSideName(match, side) {
  const nameKey = side === "home" ? "home" : "away";
  const teamKey = side === "home" ? "homeTeam" : "awayTeam";

  return getTeamString(match?.[nameKey] ?? match?.[teamKey]);
}

function isCrossedFeederSide(feederA, feederB, side, { standings } = {}) {
  const refKey = side === "home" ? "homeRef" : "awayRef";
  const refA = feederA[refKey];
  const refB = feederB[refKey];

  if (!refA || !refB) {
    return false;
  }

  if (!parseGroupPositionRef(refA) || !parseGroupPositionRef(refB)) {
    return false;
  }

  const resolvedA = resolveGroupPositionRef(refA, standings);
  const resolvedB = resolveGroupPositionRef(refB, standings);
  const bracketA = getSideName(feederA, side);
  const bracketB = getSideName(feederB, side);

  if (!resolvedA || !resolvedB || !bracketA || !bracketB) {
    return false;
  }

  if (isBracketPlaceholder(bracketA) || isBracketPlaceholder(bracketB)) {
    return false;
  }

  if (bracketA === resolvedA && bracketB === resolvedB) {
    return false;
  }

  return bracketA === resolvedB && bracketB === resolvedA;
}

function fixCrossedFeederNames(feederMatches, parentMatches, context = {}) {
  if (!Array.isArray(feederMatches) || !feederMatches.length) {
    return feederMatches;
  }

  if (!Array.isArray(parentMatches) || !parentMatches.length) {
    return feederMatches;
  }

  const updated = feederMatches.map((match) => ({ ...match }));
  const byNo = new Map();

  updated.forEach((match) => {
    const matchNo = getMatchNo(match);

    if (matchNo != null) {
      byNo.set(matchNo, match);
    }
  });

  parentMatches.forEach((parent) => {
    const feederNos = [
      parseWinnerRef(parent.homeRef),
      parseWinnerRef(parent.awayRef),
    ].filter((matchNo) => matchNo != null);

    if (feederNos.length !== 2) {
      return;
    }

    const feederA = byNo.get(feederNos[0]);
    const feederB = byNo.get(feederNos[1]);

    if (!feederA || !feederB) {
      return;
    }

    ["home", "away"].forEach((side) => {
      if (!isCrossedFeederSide(feederA, feederB, side, context)) {
        return;
      }

      const refKey = side === "home" ? "homeRef" : "awayRef";
      const resolvedA = resolveGroupPositionRef(feederA[refKey], context.standings);
      const resolvedB = resolveGroupPositionRef(feederB[refKey], context.standings);

      setSideName(feederA, side, resolvedA);
      setSideName(feederB, side, resolvedB);
    });
  });

  return updated;
}

function getMatchIdFromMatch(match) {
  return String(match?.id ?? match?.matchId ?? "");
}

function applyCrossedFeederFixesToMatches(matches, bracketLookup, standings) {
  if (!bracketLookup?.size || !Array.isArray(matches)) {
    return matches;
  }

  const slots = Array.from(bracketLookup.values());
  const parentSlots = slots.filter(
    (slot) =>
      parseWinnerRef(slot.homeRef) != null || parseWinnerRef(slot.awayRef) != null
  );

  if (!parentSlots.length) {
    return matches;
  }

  const context = { standings, matches };
  const matchByNo = new Map();
  const result = matches.map((match) => {
    const matchId = getMatchIdFromMatch(match);
    const slot = bracketLookup.get(matchId);
    const copy = { ...match };

    if (slot?.homeRef) {
      copy.homeRef = slot.homeRef;
    }

    if (slot?.awayRef) {
      copy.awayRef = slot.awayRef;
    }

    const matchNo = getMatchNo(copy);

    if (matchNo != null && slot) {
      matchByNo.set(matchNo, copy);
    }

    return copy;
  });

  if (!matchByNo.size) {
    return result;
  }

  const fixedFeeders = fixCrossedFeederNames(
    Array.from(matchByNo.values()),
    parentSlots,
    context
  );
  const fixedByNo = new Map();

  fixedFeeders.forEach((match) => {
    const matchNo = getMatchNo(match);

    if (matchNo != null) {
      fixedByNo.set(matchNo, match);
    }
  });

  return result.map((match) => {
    const matchNo = getMatchNo(match);
    const fixed = matchNo != null ? fixedByNo.get(matchNo) : null;

    if (!fixed) {
      return match;
    }

    return {
      ...match,
      homeTeam: fixed.homeTeam ?? fixed.home ?? match.homeTeam,
      awayTeam: fixed.awayTeam ?? fixed.away ?? match.awayTeam,
      home: fixed.home ?? fixed.homeTeam ?? match.home,
      away: fixed.away ?? fixed.awayTeam ?? match.away,
    };
  });
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
  const matchesByNo = buildMatchesByNo(matches);

  if (parseWinnerRef(ref) != null) {
    const winner = resolveWinnerMatchRef(ref, matchesByNo);

    if (winner) {
      return winner;
    }
  }

  const groupPosition = parseGroupPositionRef(ref);

  if (
    groupPosition &&
    hasStandingsActivityForGroup(standings, groupPosition.group)
  ) {
    const fromStandings = resolveGroupPositionRef(ref, standings);

    if (fromStandings) {
      return fromStandings;
    }
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
  applyCrossedFeederFixesToMatches,
  buildMatchesByNo,
  fixCrossedFeederNames,
  hasStandingsActivityForGroup,
  isBracketPlaceholder,
  parseBestThirdRef,
  parseGroupPositionRef,
  parseWinnerRef,
  resolveBestThirdRef,
  resolveBracketRef,
  resolveGroupPositionRef,
  resolveKnockoutSideName,
  resolveWinnerMatchRef,
};
