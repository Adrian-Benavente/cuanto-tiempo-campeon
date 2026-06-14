import React from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "./WorldCupTimeline.module.css";

export default function WorldCupTimeline({ tournaments }) {
  const { t } = useLocale();

  if (!tournaments?.length) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="timeline-title">
      <h2 className={styles.title} id="timeline-title">
        {t("timelineTitle")}
      </h2>
      <div className={styles.scroller}>
        <ol className={styles.timeline}>
          {tournaments.map((tournament) => (
            <li className={styles.item} key={tournament.year}>
              <span className={styles.year}>{tournament.year}</span>
              <span className={styles.champion}>{tournament.champion}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
