import { t } from "../i18n/translations";

const STAGE_I18N_KEYS = {
  final: "stageFinal",
  semi_final: "stageSemiFinal",
  sf: "stageSemiFinal",
  quarter_final: "stageQuarterFinal",
  qf: "stageQuarterFinal",
  third_place: "stageThirdPlace",
  round_of_16: "stageRoundOf16",
  r16: "stageRoundOf16",
  round_of_32: "stageRoundOf32",
  r32: "stageRoundOf32",
};

function humanizeFallback(stage) {
  return stage
    .split("_")
    .map((part) => {
      if (part.length === 1) {
        return part.toUpperCase();
      }

      if (/^\d+$/.test(part)) {
        return part;
      }

      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function getMatchStageRaw(match) {
  return match?.stageNormalized ?? match?.stage ?? match?.round ?? null;
}

export function formatMatchStage(stage, locale = "es") {
  if (!stage || typeof stage !== "string") {
    return null;
  }

  const normalized = stage.trim().toLowerCase();
  const groupLetter = normalized.match(/^group_([a-z])$/);

  if (groupLetter) {
    return t(locale, "stageGroup", { name: groupLetter[1].toUpperCase() });
  }

  const groupNumber = normalized.match(/^group_(\d+)$/);

  if (groupNumber) {
    return t(locale, "stageGroup", { name: groupNumber[1] });
  }

  const translationKey = STAGE_I18N_KEYS[normalized];

  if (translationKey) {
    return t(locale, translationKey);
  }

  return humanizeFallback(normalized);
}

export function formatMatchStageFromMatch(match, locale = "es") {
  return formatMatchStage(getMatchStageRaw(match), locale);
}
