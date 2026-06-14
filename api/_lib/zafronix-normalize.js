function getTeamName(team) {
  if (!team) {
    return "";
  }

  if (typeof team === "string") {
    return team;
  }

  return team.name ?? team.displayName ?? team.shortName ?? "";
}

function formatHost(host) {
  if (Array.isArray(host)) {
    return host.filter(Boolean).join(", ");
  }

  if (typeof host === "string") {
    return host;
  }

  return "";
}

function extractMatches(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.data ?? payload?.matches ?? [];
}

function findFinalMatch(matches = []) {
  return (
    matches.find((match) => match.stage === "final") ??
    matches.find((match) => /final/i.test(match.stage ?? "")) ??
    matches[0] ??
    null
  );
}

function getMatchScores(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore !== undefined && awayScore !== undefined) {
    return { homeScore, awayScore };
  }

  const result = match?.result;

  if (typeof result === "string" && result.includes("-")) {
    const [home, away] = result.split("-").map((value) => value.trim());

    if (home && away) {
      return { homeScore: home, awayScore: away };
    }
  }

  return { homeScore: undefined, awayScore: undefined };
}

function formatFinalSummary(finalMatch, championName, resolveName = (name) => name) {
  if (!finalMatch) {
    return null;
  }

  const home = getTeamName(finalMatch.homeTeam ?? finalMatch.home);
  const away = getTeamName(finalMatch.awayTeam ?? finalMatch.away);
  const { homeScore, awayScore } = getMatchScores(finalMatch);

  if (!home || !away || homeScore === undefined || awayScore === undefined) {
    return null;
  }

  const championLower = championName.toLowerCase();
  const opponentRaw =
    home.toLowerCase() === championLower || home === championName ? away : home;
  const opponent = resolveName(opponentRaw) || opponentRaw;

  return `${championName} ganó la final ${homeScore}-${awayScore} ante ${opponent}.`;
}

module.exports = {
  extractMatches,
  findFinalMatch,
  formatFinalSummary,
  formatHost,
  getMatchScores,
  getTeamName,
};
