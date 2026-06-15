export function compareByTitlesThenRecency(a, b) {
  const titleDiff = (b?.titles ?? 0) - (a?.titles ?? 0);

  if (titleDiff !== 0) {
    return titleDiff;
  }

  return (
    new Date(b?.lastChampionDate ?? 0).getTime() -
    new Date(a?.lastChampionDate ?? 0).getTime()
  );
}

export function assignCompetitionRanks(items, getGroupKey) {
  const list = Array.isArray(items) ? items : [];
  let previousKey;
  let previousRank = 0;

  return list.map((item, index) => {
    const groupKey = getGroupKey(item);
    const displayRank =
      index === 0 || groupKey !== previousKey ? index + 1 : previousRank;

    previousKey = groupKey;
    previousRank = displayRank;

    return {
      ...item,
      displayRank,
    };
  });
}
