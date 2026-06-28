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
  const groups = standings?.groups;

  if (!groups || typeof groups !== "object") {
    return [];
  }

  const upper = String(group ?? "").toUpperCase();
  const rows = groups[upper] ?? groups[upper.toLowerCase()];

  return Array.isArray(rows) ? rows : [];
}

function normalizeTeamKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getGroupLetterFromMatch(match) {
  const stage = String(match?.stage ?? match?.stageRaw ?? "")
    .trim()
    .toLowerCase();
  const stageMatch = stage.match(/^group_([a-l])$/);

  return stageMatch ? stageMatch[1].toUpperCase() : null;
}

function isGroupStageMatch(match) {
  return getGroupLetterFromMatch(match) != null;
}

function buildTeamGroupLookup(standings, matches = []) {
  const lookup = new Map();

  GROUP_LETTERS.forEach((letter) => {
    getStandingsRows(standings, letter).forEach((row) => {
      const team = getTeamString(row?.team);

      if (!team) {
        return;
      }

      lookup.set(normalizeTeamKey(team), {
        team,
        group: letter,
        position:
          row?.position != null && !Number.isNaN(Number(row.position))
            ? Number(row.position)
            : null,
        advanced: row?.advanced === true,
      });
    });
  });

  (Array.isArray(matches) ? matches : []).forEach((match) => {
    if (!isGroupStageMatch(match)) {
      return;
    }

    const letter = getGroupLetterFromMatch(match);

    if (!letter) {
      return;
    }

    [match.homeTeam, match.awayTeam, match.home, match.away].forEach((value) => {
      const team = getTeamString(value);

      if (!team) {
        return;
      }

      const key = normalizeTeamKey(team);

      if (!lookup.has(key)) {
        lookup.set(key, { team, group: letter, position: null });
      }
    });
  });

  return lookup;
}

function teamMatchesGroupPositionRef(teamMeta, parsedRef) {
  if (!teamMeta || !parsedRef) {
    return false;
  }

  if (teamMeta.group !== parsedRef.group) {
    return false;
  }

  if (teamMeta.position == null) {
    return true;
  }

  return teamMeta.position === parsedRef.position;
}

function pickTeamForGroupPositionRef(ref, candidates, teamGroupLookup) {
  const parsed = parseGroupPositionRef(ref);

  if (!parsed || !teamGroupLookup?.size) {
    return null;
  }

  for (const candidate of candidates) {
    const team = getTeamString(candidate);

    if (!team) {
      continue;
    }

    const meta = teamGroupLookup.get(normalizeTeamKey(team));

    if (teamMatchesGroupPositionRef(meta, parsed)) {
      return meta?.team ?? team;
    }
  }

  return null;
}

function isQualifiedThirdPlace(teamMeta) {
  if (!teamMeta) {
    return false;
  }

  if (teamMeta.position === 3) {
    return true;
  }

  return teamMeta.advanced === true;
}

function teamBelongsToBestThirdRef(teamMeta, ref) {
  const groupLetters = parseBestThirdRef(ref);

  if (!groupLetters?.length || !teamMeta) {
    return false;
  }

  if (!groupLetters.includes(teamMeta.group)) {
    return false;
  }

  return isQualifiedThirdPlace(teamMeta);
}

function getGroupOrderInBestThirdRef(group, ref) {
  const groupLetters = parseBestThirdRef(ref);

  if (!groupLetters?.length || !group) {
    return -1;
  }

  return groupLetters.indexOf(group);
}

function pickTeamForBestThirdRef(ref, candidates, teamGroupLookup) {
  const groupLetters = parseBestThirdRef(ref);

  if (!groupLetters?.length || !teamGroupLookup?.size) {
    return null;
  }

  const eligible = [];

  for (const candidate of candidates) {
    const team = getTeamString(candidate);

    if (!team) {
      continue;
    }

    const meta = teamGroupLookup.get(normalizeTeamKey(team));

    if (teamBelongsToBestThirdRef(meta, ref)) {
      eligible.push({
        team: meta?.team ?? team,
        order: getGroupOrderInBestThirdRef(meta.group, ref),
      });
    }
  }

  if (!eligible.length) {
    return null;
  }

  eligible.sort((left, right) => left.order - right.order);

  return eligible[0].team;
}

function getSharedBestThirdGroups(refA, refB) {
  const groupsA = parseBestThirdRef(refA);
  const groupsB = parseBestThirdRef(refB);

  if (!groupsA?.length || !groupsB?.length) {
    return [];
  }

  const groupsBSet = new Set(groupsB);

  return groupsA.filter((letter) => groupsBSet.has(letter));
}

function shouldPairBestThirdCrossCandidates(refA, refB) {
  return getSharedBestThirdGroups(refA, refB).length >= 2;
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

function isCrossedGroupPositionFeederSide(feederA, feederB, side, context = {}) {
  const refKey = side === "home" ? "homeRef" : "awayRef";
  const refA = feederA[refKey];
  const refB = feederB[refKey];
  const parsedA = parseGroupPositionRef(refA);
  const parsedB = parseGroupPositionRef(refB);

  if (!parsedA || !parsedB) {
    return false;
  }

  if (parsedA.group === parsedB.group) {
    return false;
  }

  const bracketA = getSideName(feederA, side);
  const bracketB = getSideName(feederB, side);

  if (!bracketA || !bracketB) {
    return false;
  }

  if (isBracketPlaceholder(bracketA) || isBracketPlaceholder(bracketB)) {
    return false;
  }

  const teamGroupLookup = buildTeamGroupLookup(context.standings, context.matches);
  const metaA = teamGroupLookup.get(normalizeTeamKey(bracketA));
  const metaB = teamGroupLookup.get(normalizeTeamKey(bracketB));

  if (!metaA || !metaB) {
    return false;
  }

  if (metaA.group === parsedA.group && metaB.group === parsedB.group) {
    return false;
  }

  return metaA.group === parsedB.group && metaB.group === parsedA.group;
}

function isCrossedBestThirdFeederSide(feederA, feederB, side, context = {}) {
  const refKey = side === "home" ? "homeRef" : "awayRef";
  const refA = feederA[refKey];
  const refB = feederB[refKey];

  if (!parseBestThirdRef(refA) || !parseBestThirdRef(refB)) {
    return false;
  }

  const bracketA = getSideName(feederA, side);
  const bracketB = getSideName(feederB, side);

  if (!bracketA || !bracketB) {
    return false;
  }

  if (isBracketPlaceholder(bracketA) || isBracketPlaceholder(bracketB)) {
    return false;
  }

  if (bracketA === bracketB) {
    return false;
  }

  const teamGroupLookup = buildTeamGroupLookup(context.standings, context.matches);
  const metaA = teamGroupLookup.get(normalizeTeamKey(bracketA));
  const metaB = teamGroupLookup.get(normalizeTeamKey(bracketB));

  if (!metaA || !metaB) {
    return false;
  }

  if (metaA.group === metaB.group) {
    return false;
  }

  if (
    !teamBelongsToBestThirdRef(metaA, refA) ||
    !teamBelongsToBestThirdRef(metaB, refB) ||
    !teamBelongsToBestThirdRef(metaA, refB) ||
    !teamBelongsToBestThirdRef(metaB, refA)
  ) {
    return false;
  }

  const orderAInRefA = getGroupOrderInBestThirdRef(metaA.group, refA);
  const orderBInRefA = getGroupOrderInBestThirdRef(metaB.group, refA);

  if (orderAInRefA < 0 || orderBInRefA < 0 || orderAInRefA === orderBInRefA) {
    return false;
  }

  return orderAInRefA > orderBInRefA;
}

function isCrossedFeederSide(feederA, feederB, side, context = {}) {
  const refKey = side === "home" ? "homeRef" : "awayRef";
  const refA = feederA[refKey];
  const refB = feederB[refKey];

  if (parseBestThirdRef(refA) && parseBestThirdRef(refB)) {
    return isCrossedBestThirdFeederSide(feederA, feederB, side, context);
  }

  if (parseGroupPositionRef(refA) && parseGroupPositionRef(refB)) {
    return isCrossedGroupPositionFeederSide(feederA, feederB, side, context);
  }

  return false;
}

function tryFixCrossedFeederPair(feederA, feederB, side, context, teamGroupLookup) {
  if (!isCrossedFeederSide(feederA, feederB, side, context)) {
    return false;
  }

  const refKey = side === "home" ? "homeRef" : "awayRef";
  const bracketA = getSideName(feederA, side);
  const bracketB = getSideName(feederB, side);
  const candidates = [bracketA, bracketB];
  const refA = feederA[refKey];
  const refB = feederB[refKey];
  const isBestThird = parseBestThirdRef(refA) != null;
  const teamForA = isBestThird
    ? pickTeamForBestThirdRef(refA, candidates, teamGroupLookup)
    : pickTeamForGroupPositionRef(refA, candidates, teamGroupLookup);
  const remainingCandidates = teamForA
    ? candidates.filter(
        (candidate) =>
          normalizeTeamKey(getTeamString(candidate)) !==
          normalizeTeamKey(teamForA)
      )
    : candidates;
  const teamForB = isBestThird
    ? pickTeamForBestThirdRef(refB, remainingCandidates, teamGroupLookup)
    : pickTeamForGroupPositionRef(refB, remainingCandidates, teamGroupLookup);

  if (teamForA) {
    setSideName(feederA, side, teamForA);
  }

  if (teamForB) {
    setSideName(feederB, side, teamForB);
  }

  return Boolean(teamForA || teamForB);
}

function fixOverlappingBestThirdCrosses(feederMatches, context, teamGroupLookup) {
  const orderedMatches = feederMatches
    .filter((match) => getMatchNo(match) != null)
    .slice()
    .sort((left, right) => getMatchNo(left) - getMatchNo(right));

  for (let index = 0; index < orderedMatches.length; index += 1) {
    const feederA = orderedMatches[index];
    const refA = feederA.awayRef;

    if (!parseBestThirdRef(refA)) {
      continue;
    }

    for (let nextIndex = index + 1; nextIndex < orderedMatches.length; nextIndex += 1) {
      const feederB = orderedMatches[nextIndex];
      const refB = feederB.awayRef;

      if (!parseBestThirdRef(refB)) {
        continue;
      }

      if (!shouldPairBestThirdCrossCandidates(refA, refB)) {
        continue;
      }

      tryFixCrossedFeederPair(feederA, feederB, "away", context, teamGroupLookup);
    }
  }
}

function fixCrossedFeederNames(feederMatches, parentMatches, context = {}) {
  if (!Array.isArray(feederMatches) || !feederMatches.length) {
    return feederMatches;
  }

  const teamGroupLookup = buildTeamGroupLookup(context.standings, context.matches);
  const updated = feederMatches.map((match) => ({ ...match }));
  const byNo = new Map();

  updated.forEach((match) => {
    const matchNo = getMatchNo(match);

    if (matchNo != null) {
      byNo.set(matchNo, match);
    }
  });

  (Array.isArray(parentMatches) ? parentMatches : []).forEach((parent) => {
    const feederNos = [
      parseWinnerRef(parent.homeRef),
      parseWinnerRef(parent.awayRef),
    ].filter((matchNo) => matchNo != null);

    if (feederNos.length !== 2) {
      return;
    }

    const [feederNoA, feederNoB] = feederNos.slice().sort((left, right) => left - right);
    const feederA = byNo.get(feederNoA);
    const feederB = byNo.get(feederNoB);

    if (!feederA || !feederB) {
      return;
    }

    ["home", "away"].forEach((side) => {
      tryFixCrossedFeederPair(feederA, feederB, side, context, teamGroupLookup);
    });
  });

  fixOverlappingBestThirdCrosses(updated, context, teamGroupLookup);

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
  buildTeamGroupLookup,
  fixCrossedFeederNames,
  getSharedBestThirdGroups,
  hasStandingsActivityForGroup,
  isBracketPlaceholder,
  normalizeTeamKey,
  parseBestThirdRef,
  parseGroupPositionRef,
  parseWinnerRef,
  pickTeamForBestThirdRef,
  pickTeamForGroupPositionRef,
  resolveBestThirdRef,
  resolveBracketRef,
  resolveGroupPositionRef,
  resolveKnockoutSideName,
  resolveWinnerMatchRef,
  shouldPairBestThirdCrossCandidates,
  teamBelongsToBestThirdRef,
};
