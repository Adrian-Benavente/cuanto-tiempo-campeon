import { isBracketPlaceholder } from "./matchTeams";
import { resolveBracketTeam } from "./teamMeta";

const ROUND_SHORT_LABELS = {
  round_of_32: "1/16",
  round_of_16: "1/8",
  quarter_final: "1/4",
  semi_final: "1/2",
  final: "F",
};

function normalizeWinnerName(winner) {
  if (!winner || typeof winner !== "string") {
    return null;
  }

  const trimmed = winner.trim();

  return trimmed || null;
}

function isWinner(sideName, winnerName) {
  if (!sideName || !winnerName) {
    return false;
  }

  return normalizeTeamKey(sideName) === normalizeTeamKey(winnerName);
}

function normalizeTeamKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveSide(rawName, ref, winnerName, score, hasScores) {
  const effectiveName =
    rawName && !isBracketPlaceholder(rawName) ? rawName : null;
  const resolved = resolveBracketTeam(effectiveName);
  const won =
    effectiveName && winnerName
      ? isWinner(effectiveName, winnerName)
      : false;
  const lost = hasScores && effectiveName && winnerName && !won;

  return {
    ...resolved,
    ref: ref ?? null,
    score: hasScores && score != null ? Number(score) : null,
    won,
    lost,
  };
}

function buildBracketkitMatch(match) {
  const winnerName = normalizeWinnerName(match?.winner);
  const hasScores = match?.homeScore != null && match?.awayScore != null;

  return {
    id: match.matchId,
    home: resolveSide(match.home, match.homeRef, winnerName, match.homeScore, hasScores),
    away: resolveSide(match.away, match.awayRef, winnerName, match.awayScore, hasScores),
  };
}

export function buildBracketkitRounds(bracket) {
  const rounds = bracket?.rounds;

  if (!Array.isArray(rounds) || !rounds.length) {
    return [];
  }

  return rounds.map((round) => ({
    id: round.id,
    name: round.id,
    shortLabel: ROUND_SHORT_LABELS[round.id] ?? round.id,
    matches: (round.matches ?? []).map(buildBracketkitMatch),
  }));
}

export function hasKnockoutBracket(bracket) {
  return Array.isArray(bracket?.rounds) && bracket.rounds.some((round) => round.matches?.length);
}
