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

export function getMatchScores(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore != null && awayScore != null) {
    return {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    };
  }

  const result = match?.result;

  if (typeof result === "string" && result.includes("-")) {
    const [home, away] = result.split("-").map((value) => value.trim());
    const parsedHome = Number(home);
    const parsedAway = Number(away);

    if (!Number.isNaN(parsedHome) && !Number.isNaN(parsedAway)) {
      return { homeScore: parsedHome, awayScore: parsedAway };
    }
  }

  return {
    homeScore: null,
    awayScore: null,
  };
}

export function getMatchKey(match, index = 0) {
  const homeTeam = getTeamName(match?.homeTeam ?? match?.home);
  const awayTeam = getTeamName(match?.awayTeam ?? match?.away);
  return match?.id ?? `${homeTeam}-${awayTeam}-${index}`;
}
