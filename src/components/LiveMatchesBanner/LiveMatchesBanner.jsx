import React from "react";
import { useLocale } from "../../context/LocaleContext";
import useLiveScoreHighlights from "../../hooks/useLiveScoreHighlights";
import { getMatchKey } from "../../utils/liveMatchData";
import LiveMatchCard from "./LiveMatchCard";
import RecentMatchCard from "./RecentMatchCard";
import styles from "./LiveMatchesBanner.module.css";

function LiveMatchesBanner({ mode = "recent", year = 2022, matches = [] }) {
  const { t } = useLocale();
  const isLive = mode === "live";
  const title =
    !matches.length || isLive ? t("worldCupLive") : t("recentResults");
  const subtitle = isLive || !matches.length
    ? null
    : t("recentResultsSubtitle", { year });
  const highlights = useLiveScoreHighlights(matches, isLive);

  if (!matches.length) {
    return (
      <section className={styles.banner} aria-label={t("worldCupLive")}>
        <h2 className={styles.title}>{t("worldCupLive")}</h2>
        <p className={styles.empty}>{t("noLiveMatches")}</p>
      </section>
    );
  }

  if (isLive) {
    return (
      <section
        className={`${styles.banner} ${styles.bannerLive}`}
        aria-label={title}
      >
        <div className={styles.liveHeader}>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.liveHeaderBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            {t("liveNow")}
          </span>
        </div>
        <div className={styles.scanLine} aria-hidden="true" />
        <ul className={styles.liveList}>
          {matches.map((match, index) => (
            <li key={getMatchKey(match, index)}>
              <LiveMatchCard
                match={match}
                highlights={highlights[getMatchKey(match, index)] ?? {}}
              />
            </li>
          ))}
        </ul>
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
