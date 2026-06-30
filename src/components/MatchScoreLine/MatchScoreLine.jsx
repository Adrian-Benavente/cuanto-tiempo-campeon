import React from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "../LiveMatchesBanner/LiveMatchesBanner.module.css";

export default function MatchScoreLine({
  homeScore,
  awayScore,
  homePenalties = null,
  awayPenalties = null,
}) {
  const { t } = useLocale();
  const hasPenalties = homePenalties != null && awayPenalties != null;
  const ariaLabel = hasPenalties
    ? t("scoreWithPenalties", {
        homeScore,
        awayScore,
        homePenalties,
        awayPenalties,
      })
    : `${homeScore} - ${awayScore}`;

  return (
    <span className={styles.scoreLine} aria-label={ariaLabel}>
      <span className={styles.scoreValue}>
        {homeScore}
        {hasPenalties ? (
          <span className={styles.penalties}>({homePenalties})</span>
        ) : null}
      </span>
      <span className={styles.scoreSeparator}>-</span>
      <span className={styles.scoreValue}>
        {awayScore}
        {hasPenalties ? (
          <span className={styles.penalties}>({awayPenalties})</span>
        ) : null}
      </span>
    </span>
  );
}
