export function getGroupLetterFromStageKey(stageKey) {
  if (!stageKey || typeof stageKey !== "string") {
    return null;
  }

  const match = stageKey.trim().toLowerCase().match(/^group_([a-z])$/);

  if (!match) {
    return null;
  }

  return match[1].toUpperCase();
}

export function isGroupStageKey(stageKey) {
  return getGroupLetterFromStageKey(stageKey) != null;
}

export function hasStandingsActivity(rows = []) {
  return (Array.isArray(rows) ? rows : []).some(
    (row) => (row?.played ?? 0) > 0 || (row?.points ?? 0) > 0
  );
}

export function getStandingsForGroup(standings, stageKey) {
  const groupLetter = getGroupLetterFromStageKey(stageKey);

  if (!groupLetter) {
    return [];
  }

  const rows = standings?.groups?.[groupLetter];

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.slice().sort((left, right) => {
    const leftPosition = left?.position ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = right?.position ?? Number.MAX_SAFE_INTEGER;

    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition;
    }

    return String(left?.team ?? "").localeCompare(String(right?.team ?? ""));
  });
}

export function formatGoalDifference(goalDifference) {
  const value = Number(goalDifference);

  if (Number.isNaN(value)) {
    return "0";
  }

  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}
