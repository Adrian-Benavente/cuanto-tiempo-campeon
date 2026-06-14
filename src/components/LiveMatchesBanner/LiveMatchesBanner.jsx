import React from "react";
import { useLocale } from "../../context/LocaleContext";
import styles from "./LiveMatchesBanner.module.css";

function formatMatch(match, vsLabel) {
  const home = match.homeTeam ?? match.home ?? "?";
  const away = match.awayTeam ?? match.away ?? "?";
  const homeScore = match.homeScore ?? match.score?.home;
  const awayScore = match.awayScore ?? match.score?.away;
  const hasScore = homeScore !== undefined && awayScore !== undefined;

  return hasScore
    ? `${home} ${homeScore} ${vsLabel} ${awayScore} ${away}`
    : `${home} ${vsLabel} ${away}`;
}

export default function LiveMatchesBanner({ matches }) {
  const { t } = useLocale();

  return (
    <section className={styles.banner} aria-labelledby="live-matches-title">
      <h2 className={styles.title} id="live-matches-title">
        {t("worldCupLive")}
      </h2>
      {matches?.length ? (
        <ul className={styles.list}>
          {matches.map((match, index) => (
            <li key={match.id ?? match.matchId ?? index}>
              {formatMatch(match, t("vs"))}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{t("noLiveMatches")}</p>
      )}
    </section>
  );
}
