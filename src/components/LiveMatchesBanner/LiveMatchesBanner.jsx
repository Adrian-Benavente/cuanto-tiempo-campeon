import React from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "./LiveMatchesBanner.module.css";

function getTeamName(team) {
  if (!team) {
    return "";
  }

  if (typeof team === "string") {
    return team;
  }

  return team.name ?? team.displayName ?? team.shortName ?? "";
}

function getScore(match) {
  const homeScore = match?.homeScore ?? match?.score?.home;
  const awayScore = match?.awayScore ?? match?.score?.away;

  if (homeScore === undefined || awayScore === undefined) {
    return null;
  }

  return `${homeScore} - ${awayScore}`;
}

function LiveMatchesBanner({ mode = "recent", year = 2022, matches = [] }) {
  const { t } = useLocale();
  const isLive = mode === "live";
  const title = isLive ? t("worldCupLive") : t("recentResults");
  const subtitle = isLive ? null : t("recentResultsSubtitle", { year });

  if (!matches.length) {
    return (
      <section className={styles.banner} aria-label={title}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.empty}>{t("noLiveMatches")}</p>
      </section>
    );
  }

  return (
    <section className={styles.banner} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      <ul className={styles.list}>
        {matches.map((match, index) => {
          const homeTeam = getTeamName(match.homeTeam ?? match.home);
          const awayTeam = getTeamName(match.awayTeam ?? match.away);
          const score = getScore(match);
          const stage = match.stage ?? match.round;
          const key = match.id ?? `${homeTeam}-${awayTeam}-${index}`;

          return (
            <li key={key}>
              {stage ? <span className={styles.stage}>{stage}</span> : null}
              <span className={styles.matchup}>
                {homeTeam} {score ?? t("vs")} {awayTeam}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default LiveMatchesBanner;
