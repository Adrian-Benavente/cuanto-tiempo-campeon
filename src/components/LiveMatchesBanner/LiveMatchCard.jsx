import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { formatMatchStageFromMatch } from "../../utils/formatMatchStage";
import {
  formatLastGoalLabel,
  formatLiveMinute,
  getLastGoalEvent,
  getMatchScores,
  getMatchStatus,
  getMatchStatusLabel,
  getTeamName,
} from "../../utils/liveMatchData";
import styles from "./LiveMatchesBanner.module.css";

export default function LiveMatchCard({ match, highlights = {} }) {
  const { locale, t } = useLocale();
  const homeTeam = getTeamName(match.homeTeam ?? match.home);
  const awayTeam = getTeamName(match.awayTeam ?? match.away);
  const { homeScore, awayScore } = getMatchScores(match);
  const stage = formatMatchStageFromMatch(match, locale);
  const status = getMatchStatus(match);
  const statusLabel = getMatchStatusLabel(match, locale);
  const liveMinute = formatLiveMinute(match);
  const lastGoal = getLastGoalEvent(match);
  const lastGoalLabel = formatLastGoalLabel(lastGoal, locale);
  const hasScore = homeScore != null && awayScore != null;
  const { homeFlash = false, awayFlash = false } = highlights;

  return (
    <article className={styles.liveCard}>
      <div className={styles.liveCardHeader}>
        {stage ? <span className={styles.stage}>{stage}</span> : <span />}
        <div className={styles.liveMeta}>
          {statusLabel ? (
            <span
              className={`${styles.liveBadge} ${
                status === "halftime" ? styles.liveBadgeHalftime : ""
              }`}
            >
              <span className={styles.liveDot} aria-hidden="true" />
              {statusLabel}
            </span>
          ) : null}
          {liveMinute ? (
            <span className={styles.liveMinute}>{liveMinute}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.scoreboard}>
        <span className={styles.teamName}>{homeTeam}</span>
        <div className={styles.scoreCenter}>
          {hasScore ? (
            <span className={styles.scoreLine}>
              <span
                className={`${styles.scoreValue} ${
                  homeFlash ? styles.scoreFlash : ""
                }`}
              >
                {homeScore}
              </span>
              <span className={styles.scoreSeparator}>-</span>
              <span
                className={`${styles.scoreValue} ${
                  awayFlash ? styles.scoreFlash : ""
                }`}
              >
                {awayScore}
              </span>
            </span>
          ) : (
            <span className={styles.vsLabel}>{t("vs")}</span>
          )}
        </div>
        <span className={`${styles.teamName} ${styles.teamNameAway}`}>
          {awayTeam}
        </span>
      </div>

      {lastGoalLabel ? (
        <p className={styles.lastGoal}>
          <span className={styles.goalIcon} aria-hidden="true">
            ⚽
          </span>
          {lastGoalLabel}
        </p>
      ) : null}
    </article>
  );
}
