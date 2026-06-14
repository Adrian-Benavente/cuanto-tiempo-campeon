const FALLBACK_RECENT_2022 = [
  {
    id: "wc2022-final",
    stage: "Final",
    homeTeam: "Argentina",
    awayTeam: "Francia",
    homeScore: 3,
    awayScore: 3,
    date: "2022-12-18T18:00:00.000Z",
  },
  {
    id: "wc2022-sf-1",
    stage: "Semifinal",
    homeTeam: "Francia",
    awayTeam: "Marruecos",
    homeScore: 2,
    awayScore: 0,
    date: "2022-12-14T18:00:00.000Z",
  },
  {
    id: "wc2022-sf-2",
    stage: "Semifinal",
    homeTeam: "Argentina",
    awayTeam: "Croacia",
    homeScore: 3,
    awayScore: 0,
    date: "2022-12-13T18:00:00.000Z",
  },
  {
    id: "wc2022-qf-1",
    stage: "Cuartos",
    homeTeam: "Argentina",
    awayTeam: "Países Bajos",
    homeScore: 2,
    awayScore: 2,
    date: "2022-12-09T18:00:00.000Z",
  },
  {
    id: "wc2022-qf-2",
    stage: "Cuartos",
    homeTeam: "Croacia",
    awayTeam: "Brasil",
    homeScore: 1,
    awayScore: 1,
    date: "2022-12-09T18:00:00.000Z",
  },
];

function getKickoffRaw(match) {
  if (match?.kickoffUtc) {
    return match.kickoffUtc;
  }

  if (match?.date && match?.kickoff) {
    return `${match.date}T${match.kickoff}:00Z`;
  }

  return null;
}

function getMatchDate(match) {
  const raw =
    getKickoffRaw(match) ??
    match?.date ??
    match?.dateIso ??
    match?.kickoff ??
    match?.kickoffIso;
  const parsed = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}

function hasScore(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore != null && awayScore != null) {
    return true;
  }

  const result = match?.result;

  if (typeof result === "string" && result.includes("-")) {
    const [home, away] = result.split("-").map((value) => value.trim());
    return Boolean(home && away);
  }

  return false;
}

function isInProgressMatch(match, now = new Date()) {
  const status = (match?.status ?? "").toLowerCase();

  if (status === "finished") {
    return false;
  }

  if (["live", "halftime", "half_time", "in_progress"].includes(status)) {
    return true;
  }

  if (status !== "scheduled") {
    return false;
  }

  const kickoffRaw = getKickoffRaw(match);

  if (!kickoffRaw) {
    return false;
  }

  const kickoffTime = new Date(kickoffRaw).getTime();

  if (Number.isNaN(kickoffTime) || kickoffTime > now.getTime()) {
    return false;
  }

  return match?.result == null;
}

function selectRecentMatches(matches, limit = 5, now = new Date()) {
  const list = Array.isArray(matches) ? matches : [];
  const inProgress = list.filter((match) => isInProgressMatch(match, now));
  const finished = list
    .filter(hasScore)
    .filter((match) => !isInProgressMatch(match, now))
    .sort((left, right) => getMatchDate(right) - getMatchDate(left));

  return [...inProgress, ...finished].slice(0, limit);
}

function getFallbackRecentMatches(year = 2022) {
  return {
    mode: "recent",
    year,
    matches: FALLBACK_RECENT_2022,
    source: "fallback",
  };
}

function getCurrentWorldCupYear(now = new Date()) {
  const currentYear = now.getUTCFullYear();
  return currentYear >= 2026 ? 2026 : null;
}

function getEmptyLivePayload(now = new Date(), source = "zafronix") {
  return {
    mode: "idle",
    year: getCurrentWorldCupYear(now) ?? now.getUTCFullYear(),
    matches: [],
    source,
  };
}

function getRecentTournamentYears(now = new Date()) {
  const currentWorldCupYear = getCurrentWorldCupYear(now);
  return currentWorldCupYear ? [currentWorldCupYear] : [];
}

module.exports = {
  FALLBACK_RECENT_2022,
  getCurrentWorldCupYear,
  getEmptyLivePayload,
  getFallbackRecentMatches,
  getKickoffRaw,
  getMatchDate,
  getRecentTournamentYears,
  hasScore,
  isInProgressMatch,
  selectRecentMatches,
};
