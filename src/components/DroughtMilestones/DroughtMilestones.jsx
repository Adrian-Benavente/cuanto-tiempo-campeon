import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import useLiveNow from "../../hooks/useLiveNow";
import { getActiveMilestone } from "../../utils/milestones";
import styles from "./DroughtMilestones.module.css";

export default function DroughtMilestones() {
  const { t } = useLocale();
  const { selectedCountry } = useSelectedCountry();
  const now = useLiveNow();

  const milestone = useMemo(() => {
    if (!selectedCountry?.lastChampionDate) {
      return null;
    }

    return getActiveMilestone(selectedCountry.lastChampionDate, now);
  }, [selectedCountry, now]);

  if (!milestone || !selectedCountry) {
    return null;
  }

  const message =
    milestone.type === "approaching"
      ? t("milestoneApproaching", {
          country: selectedCountry.displayName,
          days: milestone.daysRemaining,
          milestone: milestone.milestone,
        })
      : t("milestoneReached", {
          country: selectedCountry.displayName,
          milestone: milestone.milestone,
        });

  return (
    <p className={styles.banner} role="status">
      {message}
    </p>
  );
}
