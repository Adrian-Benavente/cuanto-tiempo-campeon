import { GROUP_LETTERS } from "./groupStage";

function isMatchPlayed(match) {
  const status = (match?.status ?? "").toLowerCase();

  if (status === "finished") {
    return true;
  }

  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore != null && awayScore != null) {
    return true;
  }

  const result = match?.result;

  return typeof result === "string" && result.includes("-");
}

export function getGroupRemainingMatches(matches, groupLetter) {
  const stageKey = `group_${groupLetter.toLowerCase()}`;

  return (Array.isArray(matches) ? matches : []).filter((match) => {
    const stage = String(match?.stage ?? match?.stageRaw ?? "")
      .trim()
      .toLowerCase();

    if (stage !== stageKey) {
      return false;
    }

    return !isMatchPlayed(match);
  });
}

function hasGroupActivity(groupRows) {
  return (Array.isArray(groupRows) ? groupRows : []).some(
    (row) => (row?.played ?? 0) > 0
  );
}

export function isGroupComplete(groupRows) {
  if (!Array.isArray(groupRows) || groupRows.length < 4) {
    return false;
  }

  return groupRows.every((row) => (row?.played ?? 0) >= 3);
}

export function isConfirmedDirectQualifier(team, groupRows) {
  if (!team?.team) {
    return false;
  }

  if (team.advanced === true) {
    return true;
  }

  if (isGroupComplete(groupRows)) {
    return team.position === 1 || team.position === 2;
  }

  return false;
}

function compareDirectQualifierRows(left, right) {
  const groupDiff = left.group.localeCompare(right.group);

  if (groupDiff !== 0) {
    return groupDiff;
  }

  const positionDiff = (left.position ?? 99) - (right.position ?? 99);

  if (positionDiff !== 0) {
    return positionDiff;
  }

  return (right.points ?? 0) - (left.points ?? 0);
}

export function buildDirectQualifiersTable({ standings, year }) {
  if (year !== 2026) {
    return { rows: [] };
  }

  const groups = standings?.groups ?? {};
  const rows = [];

  GROUP_LETTERS.forEach((letter) => {
    const groupRows = groups[letter];

    if (!Array.isArray(groupRows) || !groupRows.length || !hasGroupActivity(groupRows)) {
      return;
    }

    groupRows.forEach((team) => {
      if (!isConfirmedDirectQualifier(team, groupRows)) {
        return;
      }

      rows.push({
        team: team.team,
        group: letter,
        position: team.position ?? null,
        points: team.points ?? 0,
        goalDifference: team.goalDifference ?? 0,
        played: team.played ?? 0,
      });
    });
  });

  return {
    rows: rows.sort(compareDirectQualifierRows),
  };
}
