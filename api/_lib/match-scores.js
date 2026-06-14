const { isInProgressMatch } = require("./recent-matches");

function parseNumericScore(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function getExplicitScores(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore != null && awayScore != null) {
    return {
      homeScore: parseNumericScore(homeScore),
      awayScore: parseNumericScore(awayScore),
    };
  }

  return null;
}

function parseResultScores(match) {
  const result = match?.result;

  if (typeof result !== "string" || !result.includes("-")) {
    return null;
  }

  const [home, away] = result.split("-").map((value) => value.trim());
  const homeScore = parseNumericScore(home);
  const awayScore = parseNumericScore(away);

  if (homeScore == null || awayScore == null) {
    return null;
  }

  return { homeScore, awayScore };
}

function deriveScoresFromGoals(match) {
  const goals = Array.isArray(match?.goals) ? match.goals : [];

  if (goals.length === 0) {
    return null;
  }

  let homeScore = 0;
  let awayScore = 0;

  for (const goal of goals) {
    const team = (goal?.team ?? "").toLowerCase();

    if (team === "home") {
      homeScore += 1;
      continue;
    }

    if (team === "away") {
      awayScore += 1;
    }
  }

  return { homeScore, awayScore };
}

function resolveMatchScores(match, { inProgress = false } = {}) {
  const explicit = getExplicitScores(match);

  if (explicit?.homeScore != null && explicit?.awayScore != null) {
    return explicit;
  }

  const fromResult = parseResultScores(match);

  if (fromResult) {
    return fromResult;
  }

  const fromGoals = deriveScoresFromGoals(match);

  if (fromGoals) {
    return fromGoals;
  }

  if (inProgress) {
    return { homeScore: 0, awayScore: 0 };
  }

  return { homeScore: null, awayScore: null };
}

function enrichMatchScores(match, now = new Date()) {
  const inProgress = isInProgressMatch(match, now);
  const { homeScore, awayScore } = resolveMatchScores(match, { inProgress });

  if (homeScore == null || awayScore == null) {
    return match;
  }

  return {
    ...match,
    homeScore,
    awayScore,
  };
}

module.exports = {
  deriveScoresFromGoals,
  enrichMatchScores,
  resolveMatchScores,
};
