import { getTeamName } from "./liveMatchData";

const GROUP_LETTERS = "ABCDEFGHIJKL".split("");

function normalizeTeamKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isGroupStageMatch(match) {
  const stage = String(match?.stage ?? match?.stageRaw ?? "")
    .trim()
    .toLowerCase();

  return /^group_[a-l]$/.test(stage);
}

function cardDeduction(color) {
  const value = String(color ?? "").toLowerCase();

  if (value === "yellow") {
    return -1;
  }

  if (value === "second_yellow" || value === "indirect_red") {
    return -3;
  }

  if (value === "red" || value === "direct_red") {
    return -4;
  }

  return 0;
}

function getSideFairPlay(match, side) {
  if (match?.fairPlay?.[side] != null) {
    return Number(match.fairPlay[side]);
  }

  if (!Array.isArray(match?.cards)) {
    return 0;
  }

  return match.cards
    .filter((card) => card?.team === side)
    .reduce((sum, card) => sum + cardDeduction(card.color), 0);
}

export function extractThirdPlaceTeams(standings) {
  const groups = standings?.groups ?? {};
  const teams = [];

  GROUP_LETTERS.forEach((letter) => {
    const rows = groups[letter];

    if (!Array.isArray(rows)) {
      return;
    }

    const third = rows.find((row) => row?.position === 3);

    if (!third?.team) {
      return;
    }

    teams.push({
      team: third.team,
      group: letter,
      points: third.points ?? 0,
      goalDifference: third.goalDifference ?? 0,
      goalsFor: third.goalsFor ?? 0,
      played: third.played ?? 0,
      advanced: third.advanced === true,
    });
  });

  return teams;
}

export function hasBestThirdPlaceActivity(teams = []) {
  return teams.some((team) => (team?.played ?? 0) > 0);
}

export function isGroupStageComplete(teams = []) {
  if (!teams.length) {
    return false;
  }

  return teams.every((team) => (team?.played ?? 0) >= 3);
}

export function buildFairPlayByTeam(matches = []) {
  const totals = {};

  (Array.isArray(matches) ? matches : []).forEach((match) => {
    if (!isGroupStageMatch(match)) {
      return;
    }

    const homeName = getTeamName(match.homeTeam ?? match.home);
    const awayName = getTeamName(match.awayTeam ?? match.away);

    if (!homeName || !awayName) {
      return;
    }

    const homeKey = normalizeTeamKey(homeName);
    const awayKey = normalizeTeamKey(awayName);
    const homeFairPlay = getSideFairPlay(match, "home");
    const awayFairPlay = getSideFairPlay(match, "away");

    totals[homeKey] = (totals[homeKey] ?? 0) + homeFairPlay;
    totals[awayKey] = (totals[awayKey] ?? 0) + awayFairPlay;
  });

  return totals;
}

export function buildFifaRankLookup(snapshot) {
  const lookup = new Map();
  const teams = snapshot?.teams ?? {};

  Object.entries(teams).forEach(([teamName, rank]) => {
    lookup.set(normalizeTeamKey(teamName), rank);
  });

  (snapshot?.aliases ?? []).forEach(({ names, rank }) => {
    names.forEach((name) => {
      lookup.set(normalizeTeamKey(name), rank);
    });
  });

  return lookup;
}

export function getFifaRank(teamName, fifaRankLookup) {
  const rank = fifaRankLookup?.get(normalizeTeamKey(teamName));

  return rank ?? Number.MAX_SAFE_INTEGER;
}

export function rankBestThirdPlace(teams = [], { fairPlayByTeam = {}, fifaRankLookup } = {}) {
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

    const leftFairPlay =
      fairPlayByTeam[normalizeTeamKey(left.team)] ?? left.fairPlay ?? 0;
    const rightFairPlay =
      fairPlayByTeam[normalizeTeamKey(right.team)] ?? right.fairPlay ?? 0;

    if (leftFairPlay !== rightFairPlay) {
      return rightFairPlay - leftFairPlay;
    }

    const leftRank = getFifaRank(left.team, fifaRankLookup);
    const rightRank = getFifaRank(right.team, fifaRankLookup);

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return String(left.team).localeCompare(String(right.team));
  });
}

export function buildBestThirdPlaceTable({
  standings,
  matches = [],
  fifaRankLookup,
  year,
}) {
  if (year !== 2026) {
    return {
      rows: [],
      isProjection: false,
      hasFairPlayData: false,
    };
  }

  const thirdPlace = extractThirdPlaceTeams(standings);

  if (!hasBestThirdPlaceActivity(thirdPlace)) {
    return {
      rows: [],
      isProjection: false,
      hasFairPlayData: false,
    };
  }

  const fairPlayByTeam = buildFairPlayByTeam(matches);
  const hasFairPlayData = Object.values(fairPlayByTeam).some((value) => value !== 0);
  const sorted = rankBestThirdPlace(thirdPlace, { fairPlayByTeam, fifaRankLookup });
  const anyAdvancedSet = sorted.some((team) => team.advanced === true);
  const groupStageComplete = isGroupStageComplete(sorted);

  const rows = sorted.map((row, index) => {
    const rank = index + 1;
    const fairPlay = fairPlayByTeam[normalizeTeamKey(row.team)] ?? 0;

    return {
      ...row,
      rank,
      fairPlay,
      qualifies: anyAdvancedSet ? row.advanced === true : rank <= 8,
    };
  });

  return {
    rows,
    isProjection: !groupStageComplete || !anyAdvancedSet,
    hasFairPlayData,
  };
}

export { normalizeTeamKey };
