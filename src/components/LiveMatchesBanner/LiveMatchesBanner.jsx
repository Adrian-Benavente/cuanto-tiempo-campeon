import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { getMatchKey } from "../../utils/liveMatchData";
import RecentMatchCard from "./RecentMatchCard";
import styles from "./LiveMatchesBanner.module.css";

function LiveMatchesBanner({ year = 2022, matches = [] }) {
  const { t } = useLocale();
  const title = t("recentResults");
  const subtitle = matches.length ? t("recentResultsSubtitle", { year }) : null;

  if (!matches.length) {
    return (
      <section className={styles.banner} aria-label={title}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.empty}>{t("noRecentResults")}</p>
      </section>
    );
  }

  return (
    <section className={styles.banner} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      <ul className={styles.recentList}>
        {matches.map((match, index) => (
          <li key={getMatchKey(match, index)}>
            <RecentMatchCard match={match} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LiveMatchesBanner;
