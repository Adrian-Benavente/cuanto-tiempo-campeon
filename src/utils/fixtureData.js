import { formatMatchStage, getMatchStageRaw } from "./formatMatchStage";

const GROUP_LETTERS = "abcdefghijkl".split("");
const STAGE_ORDER = [
  ...GROUP_LETTERS.map((letter) => `group_${letter}`),
  "round_of_32",
  "r32",
  "round_of_16",
  "r16",
  "quarter_final",
  "qf",
  "semi_final",
  "sf",
  "third_place",
  "thirdplace",
  "final",
];

const STAGE_SORT_INDEX = STAGE_ORDER.reduce((lookup, stage, index) => {
  lookup[stage] = index;
  return lookup;
}, {});

const KNOCKOUT_STAGE_KEYS = new Set([
  "round_of_32",
  "r32",
  "round_of_16",
  "r16",
  "quarter_final",
  "qf",
  "semi_final",
  "sf",
  "third_place",
  "thirdplace",
  "final",
]);

function parseMatchNoFromId(matchId) {
  const match = String(matchId ?? "").match(/-(\d+)$/);

  return match ? Number(match[1]) : null;
}

function getMatchNo(match) {
  if (match?.matchNo != null && !Number.isNaN(Number(match.matchNo))) {
    return Number(match.matchNo);
  }

  return parseMatchNoFromId(match?.id ?? match?.matchId);
}

function isKnockoutStageKey(stageKey) {
  return KNOCKOUT_STAGE_KEYS.has(stageKey);
}

function normalizeStageKey(stage) {
  if (!stage || typeof stage !== "string") {
    return "unknown";
  }

  return stage.trim().toLowerCase().replace("thirdplace", "third_place");
}

export function getStageSortIndex(stage) {
  const key = normalizeStageKey(stage);
  return STAGE_SORT_INDEX[key] ?? 999;
}

export function groupMatchesByStage(matches, locale = "es") {
  const groups = new Map();

  (Array.isArray(matches) ? matches : []).forEach((match) => {
    const stageRaw = getMatchStageRaw(match) ?? "unknown";
    const stageKey = normalizeStageKey(stageRaw);

    if (!groups.has(stageKey)) {
      groups.set(stageKey, {
        stageKey,
        stageRaw,
        label: formatMatchStage(stageRaw, locale) ?? stageRaw,
        matches: [],
      });
    }

    groups.get(stageKey).matches.push(match);
  });

  return Array.from(groups.values())
    .sort(
      (left, right) => getStageSortIndex(left.stageKey) - getStageSortIndex(right.stageKey)
    )
    .map((section) => ({
      ...section,
      matches: isKnockoutStageKey(section.stageKey)
        ? section.matches
            .slice()
            .sort(
              (left, right) =>
                (getMatchNo(left) ?? Number.MAX_SAFE_INTEGER) -
                (getMatchNo(right) ?? Number.MAX_SAFE_INTEGER)
            )
        : section.matches,
    }));
}
