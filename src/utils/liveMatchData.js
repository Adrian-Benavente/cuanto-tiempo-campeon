import { t } from "../i18n/translations";

export function getTeamName(team) {
  if (!team) {
    return "";
  }

  if (typeof team === "string") {
    return team;
  }

  return team.name ?? team.displayName ?? team.shortName ?? "";
}

export function getMatchScores(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  return {
    homeScore: homeScore ?? null,
    awayScore: awayScore ?? null,
  };
}

function normalizeGoalEvent(event, source = "events") {
  if (!event) {
    return null;
  }

  const minute = event.minute ?? event.liveMinute ?? null;
  const scorer =
    event.scorer ?? event.player ?? event.payload?.scorer ?? event.payload?.player ?? null;
  const team = getTeamName(
    event.team ?? event.payload?.team ?? event.side ?? event.payload?.side
  );

  if (minute == null && !scorer && !team) {
    return null;
  }

  return {
    minute,
    scorer: typeof scorer === "string" ? scorer : scorer?.name ?? null,
    team: team || null,
    source,
  };
}

export function getLastGoalEvent(match) {
  const events = Array.isArray(match?.events) ? match.events : [];
  const goalEvents = events.filter((event) => {
    const type = event?.type ?? event?.payload?.type;
    return type === "goal";
  });

  if (goalEvents.length > 0) {
    return normalizeGoalEvent(goalEvents.at(-1), "events");
  }

  const goals = Array.isArray(match?.goals) ? match.goals : [];

  if (goals.length > 0) {
    return normalizeGoalEvent(goals.at(-1), "goals");
  }

  return null;
}

function getKickoffTime(match) {
  const kickoffRaw =
    match?.kickoffUtc ??
    (match?.date && match?.kickoff ? `${match.date}T${match.kickoff}:00Z` : null);

  if (!kickoffRaw) {
    return null;
  }

  const kickoffTime = new Date(kickoffRaw).getTime();
  return Number.isNaN(kickoffTime) ? null : kickoffTime;
}

export function getMatchStatus(match, now = new Date()) {
  const status = match?.status?.toLowerCase?.() ?? match?.status;

  if (status === "halftime" || status === "half_time") {
    return "halftime";
  }

  if (status === "live" || status === "in_progress") {
    return "live";
  }

  if (status === "scheduled") {
    const kickoffTime = getKickoffTime(match);

    if (
      kickoffTime != null &&
      kickoffTime <= now.getTime() &&
      match?.result == null
    ) {
      return "live";
    }
  }

  return null;
}

export function getMatchStatusLabel(match, locale = "es", now = new Date()) {
  const status = getMatchStatus(match, now);

  if (status === "halftime") {
    return t(locale, "halftime");
  }

  if (status === "live") {
    return t(locale, "liveNow");
  }

  return null;
}

export function formatLiveMinute(match) {
  const minute = match?.liveMinute ?? match?.minute;

  if (minute == null || minute === "") {
    return null;
  }

  return `${minute}'`;
}

export function formatLastGoalLabel(goal, locale = "es") {
  if (!goal) {
    return null;
  }

  const minute = goal.minute;
  const hasMinute = minute != null && minute !== "";

  if (hasMinute && goal.scorer) {
    return t(locale, "liveGoalBy", { minute, scorer: goal.scorer });
  }

  if (hasMinute && goal.team) {
    return t(locale, "liveGoal", { minute, team: goal.team });
  }

  if (goal.scorer) {
    return goal.scorer;
  }

  if (hasMinute) {
    return `${minute}'`;
  }

  return null;
}

export function detectScoreChange(previousMatch, nextMatch) {
  if (!previousMatch || !nextMatch) {
    return { homeChanged: false, awayChanged: false };
  }

  const previous = getMatchScores(previousMatch);
  const next = getMatchScores(nextMatch);

  return {
    homeChanged:
      previous.homeScore != null &&
      next.homeScore != null &&
      next.homeScore > previous.homeScore,
    awayChanged:
      previous.awayScore != null &&
      next.awayScore != null &&
      next.awayScore > previous.awayScore,
  };
}

export function getMatchKey(match, index = 0) {
  const homeTeam = getTeamName(match?.homeTeam ?? match?.home);
  const awayTeam = getTeamName(match?.awayTeam ?? match?.away);
  return match?.id ?? `${homeTeam}-${awayTeam}-${index}`;
}
