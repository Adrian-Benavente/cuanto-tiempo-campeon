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

  return Array.from(groups.values()).sort(
    (left, right) => getStageSortIndex(left.stageKey) - getStageSortIndex(right.stageKey)
  );
}
