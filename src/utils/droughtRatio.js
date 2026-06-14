export function getDroughtMs(lastChampionDate, now = new Date()) {
  return Math.max(0, now.getTime() - new Date(lastChampionDate).getTime());
}

export function getDroughtRatio(lastChampionDate, maxMs, now = new Date()) {
  if (!maxMs || maxMs <= 0) {
    return 0;
  }

  return Math.min(1, getDroughtMs(lastChampionDate, now) / maxMs);
}

export function getMaxDroughtMs(champions, now = new Date()) {
  if (!champions?.length) {
    return 0;
  }

  return Math.max(
    ...champions.map((champion) => getDroughtMs(champion.lastChampionDate, now))
  );
}
