import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import { formatDuration } from "../../utils/formatDuration";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./WorldChampionsList.module.css";

export default function WorldChampionsList() {
  const { champions } = useWorldChampionsContext();
  const now = useLiveNow();

  const rankedChampions = useMemo(
    () =>
      champions.slice(1).map((champion, index) => ({
        ...champion,
        rank: index + 2,
        duration: intervalToDuration({
          start: new Date(champion.lastChampionDate),
          end: now,
        }),
      })),
    [champions, now]
  );

  if (rankedChampions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="ranking-title">
      <h2 className={styles.sectionTitle} id="ranking-title">
        Resto de campeones mundiales
      </h2>
      <ul className={styles.rankingList}>
        {rankedChampions.map((champion, index) => (
          <li
            key={champion.slug}
            className={styles.rankingItem}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className={styles.rank}>#{champion.rank}</span>
            <CountryFlag
              champion={champion}
              imageClassName={styles.countryFlag}
              fallbackClassName={styles.countryFlagFallback}
            />
            <span className={styles.countryName}>{champion.displayName}</span>
            <span className={styles.durationBadge}>
              {formatDuration(champion.duration, false)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
