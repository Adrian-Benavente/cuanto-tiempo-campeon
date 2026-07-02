function parseMinuteValue(minute, addedMinute = 0) {
  if (minute == null || minute === "") {
    return null;
  }

  const base = Number(minute);

  if (Number.isNaN(base)) {
    return null;
  }

  const added = Number(addedMinute);

  if (!Number.isNaN(added) && added > 0) {
    return base + added / 100;
  }

  return base;
}

export function formatGoalMinute(goal) {
  if (!goal) {
    return "—";
  }

  const minute = goal.minute;
  const addedMinute = goal.addedMinute;

  if (minute == null || minute === "") {
    return "—";
  }

  if (addedMinute != null && addedMinute !== "" && Number(addedMinute) > 0) {
    return `${minute}+${addedMinute}`;
  }

  return String(minute);
}

function getGoalSortKey(goal) {
  const sortMinute = parseMinuteValue(goal?.minute, goal?.addedMinute);
  return sortMinute ?? Number.POSITIVE_INFINITY;
}

export function normalizeMatchGoals(match) {
  const goals = Array.isArray(match?.goals) ? [...match.goals] : [];

  return goals
    .map((goal) => ({
      minuteLabel: formatGoalMinute(goal),
      sortMinute: getGoalSortKey(goal),
      team: goal?.team ?? null,
      scorer: goal?.scorer ?? null,
      assist: goal?.assist ?? null,
      type: goal?.type ?? "normal",
      provisional: Boolean(goal?.provisional),
    }))
    .sort((left, right) => left.sortMinute - right.sortMinute);
}

function getEventSortKey(event) {
  return parseMinuteValue(event?.minute, event?.addedMinute) ?? Number.POSITIVE_INFINITY;
}

export function normalizeMatchEvents(match) {
  const cards = (match?.cards ?? []).map((card) => ({
    kind: "card",
    minute: card?.minute ?? null,
    addedMinute: card?.addedMinute ?? null,
    minuteLabel: formatGoalMinute(card),
    sortMinute: getEventSortKey(card),
    team: card?.team ?? null,
    player: card?.player ?? null,
    color: card?.color ?? null,
  }));

  const substitutions = (match?.substitutions ?? []).map((sub) => ({
    kind: "substitution",
    minute: sub?.minute ?? null,
    addedMinute: sub?.addedMinute ?? null,
    minuteLabel: formatGoalMinute(sub),
    sortMinute: getEventSortKey(sub),
    team: sub?.team ?? null,
    on: sub?.on ?? null,
    off: sub?.off ?? null,
  }));

  return [...cards, ...substitutions].sort(
    (left, right) => left.sortMinute - right.sortMinute
  );
}

function readStatValue(side, key) {
  const value = side?.[key];

  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

const STAT_ROW_DEFS = [
  { key: "possessionPct", labelKey: "statPossession", bar: true },
  { key: "shotsTotal", labelKey: "statShots", bar: true },
  { key: "shotsOnGoal", labelKey: "statShotsOnGoal", bar: true },
  { key: "corners", labelKey: "statCorners", bar: true },
  { key: "fouls", labelKey: "statFouls", bar: true },
  { key: "expectedGoals", labelKey: "statExpectedGoals", bar: true, decimals: 2 },
  { key: "passesPct", labelKey: "statPassesPct", bar: true },
  { key: "goalkeeperSaves", labelKey: "statSaves", bar: true },
  { key: "offsides", labelKey: "statOffsides", bar: true },
  { key: "yellowCards", labelKey: "statYellowCards", bar: true },
  { key: "passesTotal", labelKey: "statPassesTotal", bar: false },
  { key: "passesAccurate", labelKey: "statPassesAccurate", bar: false },
];

export function getMatchStatRows(match) {
  const home = match?.statistics?.home;
  const away = match?.statistics?.away;

  if (!home && !away) {
    return [];
  }

  return STAT_ROW_DEFS.map((def) => {
    const homeValue = readStatValue(home, def.key);
    const awayValue = readStatValue(away, def.key);

    if (homeValue == null && awayValue == null) {
      return null;
    }

    return {
      key: def.key,
      labelKey: def.labelKey,
      bar: def.bar,
      decimals: def.decimals ?? 0,
      homeValue: homeValue ?? 0,
      awayValue: awayValue ?? 0,
    };
  }).filter(Boolean);
}

export function getMatchLineupSide(lineup) {
  const players = Array.isArray(lineup) ? lineup : [];

  return {
    starters: players.filter((player) => player?.starter),
    substitutes: players.filter((player) => !player?.starter),
  };
}

export function getMatchDetailSections(match) {
  const goals = normalizeMatchGoals(match);
  const events = normalizeMatchEvents(match);
  const statRows = getMatchStatRows(match);
  const homeLineup = getMatchLineupSide(match?.lineups?.home);
  const awayLineup = getMatchLineupSide(match?.lineups?.away);

  return {
    hasGoals: goals.length > 0,
    hasEvents: events.length > 0,
    hasStats: statRows.length > 0,
    hasLineups:
      homeLineup.starters.length > 0 ||
      homeLineup.substitutes.length > 0 ||
      awayLineup.starters.length > 0 ||
      awayLineup.substitutes.length > 0,
    hasWeather: match?.weather?.tempC != null,
    hasFairPlay: match?.fairPlay != null,
    hasFormations: Boolean(match?.formations?.home || match?.formations?.away),
    hasVenue: Boolean(match?.stadium || match?.city),
    hasAttendance: match?.attendance != null,
    hasReferee: Boolean(match?.referee?.name),
    goals,
    events,
    statRows,
    homeLineup,
    awayLineup,
  };
}

export function formatAttendance(value, locale = "es") {
  if (value == null) {
    return null;
  }

  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR").format(value);
}

export function getTeamSideLabel(teamKey, match, t) {
  if (teamKey === "home") {
    return match?.homeTeam ?? match?.home ?? t("matchDetailHome");
  }

  return match?.awayTeam ?? match?.away ?? t("matchDetailAway");
}
