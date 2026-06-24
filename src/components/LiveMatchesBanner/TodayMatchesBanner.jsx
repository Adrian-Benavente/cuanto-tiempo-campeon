import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { getMatchKey } from "../../utils/liveMatchData";
import UpcomingMatchCard from "./UpcomingMatchCard";
import styles from "./LiveMatchesBanner.module.css";

function TodayMatchesBanner({ year = 2026, matches = [] }) {
  const { t } = useLocale();
  const title = t("todayMatches");
  const subtitle = t("todayMatchesSubtitle", { year });

  if (!matches.length) {
    return null;
  }

  return (
    <section className={styles.banner} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
      <ul className={styles.recentList}>
        {matches.map((match, index) => (
          <li key={getMatchKey(match, index)}>
            <UpcomingMatchCard match={match} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TodayMatchesBanner;
