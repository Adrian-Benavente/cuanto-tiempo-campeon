import { getTeamName } from "./liveMatchData";

const BRACKET_PLACEHOLDER_PATTERN =
  /^(?:\d+[A-L]|W\d+|L\d+|3[A-L]+)$/i;

export function isBracketPlaceholder(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return BRACKET_PLACEHOLDER_PATTERN.test(trimmed);
}

export function getMatchSideRawName(match, side) {
  const isHome = side === "home";
  const team = isHome
    ? match?.homeTeam ?? match?.home
    : match?.awayTeam ?? match?.away;
  const ref = isHome ? match?.homeRef : match?.awayRef;
  const teamName = getTeamName(team);

  if (teamName && !isBracketPlaceholder(teamName)) {
    return teamName;
  }

  if (typeof ref === "string" && ref.trim() && !isBracketPlaceholder(ref.trim())) {
    return ref.trim();
  }

  return "";
}

export function getMatchSideDisplayName(match, side, tbdLabel = "TBD") {
  const rawName = getMatchSideRawName(match, side);

  if (!rawName || isBracketPlaceholder(rawName)) {
    return { name: tbdLabel, isPlaceholder: true };
  }

  return { name: rawName, isPlaceholder: false };
}
