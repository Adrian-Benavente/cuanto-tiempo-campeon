import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { formatMatchStageFromMatch } from "../../utils/formatMatchStage";
import { formatMatchKickoffTime } from "../../utils/formatMatchDateTime";
import { getKickoffRaw } from "../../utils/liveMatchData";
import { getMatchSideDisplayName } from "../../utils/matchTeams";
import styles from "./LiveMatchesBanner.module.css";

export default function UpcomingMatchCard({ match }) {
  const { locale, t } = useLocale();
  const tbdLabel = t("fixtureTbd");
  const home = getMatchSideDisplayName(match, "home", tbdLabel);
  const away = getMatchSideDisplayName(match, "away", tbdLabel);
  const stage = formatMatchStageFromMatch(match, locale);
  const kickoffTime = formatMatchKickoffTime(match, locale);
  const kickoffRaw = getKickoffRaw(match);

  return (
    <article className={styles.recentCard}>
      <div className={styles.recentCardHeader}>
        {stage ? <span className={styles.stage}>{stage}</span> : <span />}
        {kickoffTime ? (
          <time className={styles.kickoffTime} dateTime={kickoffRaw ?? undefined}>
            {t("kickoffAt", { time: kickoffTime })}
          </time>
        ) : null}
      </div>

      <div className={styles.scoreboard}>
        <span
          className={`${styles.teamName} ${
            home.isPlaceholder ? styles.placeholderTeam : ""
          }`}
        >
          {home.name}
        </span>
        <div className={styles.scoreCenter}>
          <span className={styles.vsLabel}>{t("vs")}</span>
        </div>
        <span
          className={`${styles.teamName} ${styles.teamNameAway} ${
            away.isPlaceholder ? styles.placeholderTeam : ""
          }`}
        >
          {away.name}
        </span>
      </div>
    </article>
  );
}
