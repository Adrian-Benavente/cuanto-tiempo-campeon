import React from "react";
import { useLocale } from "../../context/LocaleContext";
import { formatMatchStageFromMatch } from "../../utils/formatMatchStage";
import { getKickoffRaw } from "../../utils/liveMatchData";
import { getMatchSideDisplayName } from "../../utils/matchTeams";
import styles from "./LiveMatchesBanner.module.css";

function formatKickoffTime(match, locale) {
  const kickoffRaw = getKickoffRaw(match);

  if (!kickoffRaw) {
    return null;
  }

  const kickoff = new Date(kickoffRaw);

  if (Number.isNaN(kickoff.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(kickoff);
}

export default function UpcomingMatchCard({ match }) {
  const { locale, t } = useLocale();
  const tbdLabel = t("fixtureTbd");
  const home = getMatchSideDisplayName(match, "home", tbdLabel);
  const away = getMatchSideDisplayName(match, "away", tbdLabel);
  const stage = formatMatchStageFromMatch(match, locale);
  const kickoffTime = formatKickoffTime(match, locale);
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
