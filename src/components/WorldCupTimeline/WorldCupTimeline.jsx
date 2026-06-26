import React from "react";
import { useLocale } from "../../context/LocaleContext";
import useTournamentCompare from "../../hooks/useTournamentCompare";
import WorldCupComparePanel from "../WorldCupCompare/WorldCupComparePanel";
import styles from "./WorldCupTimeline.module.css";

export default function WorldCupTimeline({ tournaments }) {
  const { t } = useLocale();
  const {
    selectedYears,
    toggleYear,
    clearSelection,
    comparison,
    status,
  } = useTournamentCompare();

  if (!tournaments?.length) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="timeline-title">
      <h2 className={styles.title} id="timeline-title">
        {t("timelineTitle")}
      </h2>
      <p className={styles.hint}>{t("timelineCompareHint")}</p>
      <div className={styles.scroller}>
        <ol className={styles.timeline}>
          {tournaments.map((tournament) => {
            const isSelected = selectedYears.includes(tournament.year);
            const championLabel = tournament.upcoming
              ? t("timelineUpcoming")
              : tournament.champion;

            return (
              <li key={tournament.year}>
                <button
                  type="button"
                  className={`${styles.item} ${
                    isSelected ? styles.itemSelected : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => toggleYear(tournament.year)}
                >
                  <span className={styles.year}>{tournament.year}</span>
                  <span className={styles.champion}>{championLabel}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <WorldCupComparePanel
        years={selectedYears}
        rows={comparison?.rows ?? []}
        status={status}
        onClear={clearSelection}
      />
    </section>
  );
}
