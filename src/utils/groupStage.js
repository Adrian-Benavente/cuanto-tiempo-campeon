export const GROUP_LETTERS = "ABCDEFGHIJKL".split("");

export function normalizeTeamKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isGroupStageMatch(match) {
  const stage = String(match?.stage ?? match?.stageRaw ?? "")
    .trim()
    .toLowerCase();

  return /^group_[a-l]$/.test(stage);
}

export function getGroupLetterFromMatch(match) {
  const stage = String(match?.stage ?? match?.stageRaw ?? "")
    .trim()
    .toLowerCase();
  const matchResult = stage.match(/^group_([a-l])$/);

  return matchResult ? matchResult[1].toUpperCase() : null;
}
