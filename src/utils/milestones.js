import { getDroughtMs } from "./droughtRatio";

const MILESTONE_DAYS = [365, 1000, 2000, 5000, 10000];

export function getActiveMilestone(lastChampionDate, now = new Date()) {
  const droughtDays = Math.floor(getDroughtMs(lastChampionDate, now) / 86400000);

  const upcoming = MILESTONE_DAYS.find(
    (milestone) =>
      droughtDays < milestone && milestone - droughtDays <= 7
  );

  if (upcoming) {
    return {
      type: "approaching",
      milestone: upcoming,
      daysRemaining: upcoming - droughtDays,
    };
  }

  const reached = MILESTONE_DAYS.find(
    (milestone) => droughtDays >= milestone && droughtDays - milestone <= 7
  );

  if (reached) {
    return {
      type: "reached",
      milestone: reached,
      daysRemaining: 0,
    };
  }

  return null;
}
