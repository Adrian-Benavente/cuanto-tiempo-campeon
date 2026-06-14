import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { formatMatchStageFromMatch } from "../../utils/formatMatchStage";
import {
  getMatchScores,
  getTeamName,
  isMatchInProgress,
} from "../../utils/liveMatchData";
import styles from "./LiveMatchesBanner.module.css";

function formatMatchDate(date, locale) {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

export default function RecentMatchCard({ match }) {
  const { locale, t } = useLocale();
  const homeTeam = getTeamName(match.homeTeam ?? match.home);
  const awayTeam = getTeamName(match.awayTeam ?? match.away);
  const inProgress = isMatchInProgress(match);
  const { homeScore, awayScore } = getMatchScores(match);
  const hasScore = !inProgress && homeScore != null && awayScore != null;
  const stage = formatMatchStageFromMatch(match, locale);
  const matchDate = formatMatchDate(match.date, locale);

  return (
    <article
      className={`${styles.recentCard} ${
        inProgress ? styles.recentCardInProgress : ""
      }`}
    >
      <div className={styles.recentCardHeader}>
        {stage ? <span className={styles.stage}>{stage}</span> : <span />}
        {matchDate ? (
          <time className={styles.recentCardDate} dateTime={match.date}>
            {matchDate}
          </time>
        ) : null}
      </div>

      <div className={styles.scoreboard}>
        <span className={styles.teamName}>{homeTeam}</span>
        <div className={styles.scoreCenter}>
          {inProgress ? (
            <span className={styles.matchInProgressLabel}>
              {t("matchInProgress")}
            </span>
          ) : hasScore ? (
            <span className={styles.scoreLine}>
              <span className={styles.scoreValue}>{homeScore}</span>
              <span className={styles.scoreSeparator}>-</span>
              <span className={styles.scoreValue}>{awayScore}</span>
            </span>
          ) : (
            <span className={styles.vsLabel}>{t("vs")}</span>
          )}
        </div>
        <span className={`${styles.teamName} ${styles.teamNameAway}`}>
          {awayTeam}
        </span>
      </div>
    </article>
  );
}
