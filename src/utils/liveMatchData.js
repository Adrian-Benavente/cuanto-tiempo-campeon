export function getTeamName(team) {
  if (!team) {
    return "";
  }

  if (typeof team === "string") {
    return team;
  }

  return team.name ?? team.displayName ?? team.shortName ?? "";
}

export function getKickoffRaw(match) {
  if (match?.kickoffUtc) {
    return match.kickoffUtc;
  }

  if (match?.date && match?.kickoff) {
    return `${match.date}T${match.kickoff}:00Z`;
  }

  return null;
}

function getKickoffTime(match) {
  const kickoffRaw = getKickoffRaw(match);

  if (!kickoffRaw) {
    return null;
  }

  const kickoffTime = new Date(kickoffRaw).getTime();
  return Number.isNaN(kickoffTime) ? null : kickoffTime;
}

const MATCH_MAX_DURATION_MS = 165 * 60 * 1000;

export function isMatchInProgress(match, now = new Date()) {
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

  const kickoffTime = getKickoffTime(match);

  if (kickoffTime == null || kickoffTime > now.getTime()) {
    return false;
  }

  if (now.getTime() - kickoffTime > MATCH_MAX_DURATION_MS) {
    return false;
  }

  return match?.result == null;
}

function parseNumericScore(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function readPenaltySide(source, ...keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const parsed = parseNumericScore(source[key]);

    if (parsed != null) {
      return parsed;
    }
  }

  return null;
}

function getPenaltyScoresFromObject(source) {
  const homePenalties = readPenaltySide(source, "homeScore", "home");
  const awayPenalties = readPenaltySide(source, "awayScore", "away");

  if (homePenalties != null && awayPenalties != null) {
    return { homePenalties, awayPenalties };
  }

  return null;
}

export function getMatchScores(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore != null && awayScore != null) {
    return {
      homeScore: parseNumericScore(homeScore),
      awayScore: parseNumericScore(awayScore),
    };
  }

  const result = match?.result;

  if (typeof result === "string" && result.includes("-")) {
    const [home, away] = result.split("-").map((value) => value.trim());
    const parsedHome = parseNumericScore(home);
    const parsedAway = parseNumericScore(away);

    if (parsedHome != null && parsedAway != null) {
      return { homeScore: parsedHome, awayScore: parsedAway };
    }
  }

  return {
    homeScore: null,
    awayScore: null,
  };
}

export function getMatchPenaltyScores(match) {
  const fromPenalties = getPenaltyScoresFromObject(match?.penalties);
  const fromShootout = getPenaltyScoresFromObject(match?.penaltyShootout);
  const resolved = fromPenalties ?? fromShootout;

  return (
    resolved ?? {
      homePenalties: null,
      awayPenalties: null,
    }
  );
}

export function hasPenaltyShootout(match) {
  const { homePenalties, awayPenalties } = getMatchPenaltyScores(match);
  return homePenalties != null && awayPenalties != null;
}

export function getMatchScoreDisplay(match) {
  const { homeScore, awayScore } = getMatchScores(match);
  const { homePenalties, awayPenalties } = getMatchPenaltyScores(match);

  return {
    homeScore,
    awayScore,
    homePenalties,
    awayPenalties,
    hasPenalties: homePenalties != null && awayPenalties != null,
  };
}

export function getMatchKey(match, index = 0) {
  const homeTeam = getTeamName(match?.homeTeam ?? match?.home);
  const awayTeam = getTeamName(match?.awayTeam ?? match?.away);
  return match?.id ?? `${homeTeam}-${awayTeam}-${index}`;
}
