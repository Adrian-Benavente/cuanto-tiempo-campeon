import React, { useMemo, useState } from "react";
import { intervalToDuration } from "date-fns";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import { getDroughtRatio, getMaxDroughtMs } from "../../utils/droughtRatio";
import { getTitlesForSlug } from "../../utils/championTitles";
import { formatDuration } from "../../utils/formatDuration";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./WorldChampionsList.module.css";

export default function WorldChampionsList({ aggregates = [] }) {
  const { locale, t } = useLocale();
  const { champions } = useWorldChampionsContext();
  const { selectedSlug } = useSelectedCountry();
  const now = useLiveNow();
  const [sortMode, setSortMode] = useState("drought");

  const maxDroughtMs = useMemo(
    () => getMaxDroughtMs(champions, now),
    [champions, now]
  );

  const rankedChampions = useMemo(() => {
    const base = champions.map((champion) => ({
      ...champion,
      titles: getTitlesForSlug(champion.slug, aggregates),
      duration: intervalToDuration({
        start: new Date(champion.lastChampionDate),
        end: now,
      }),
      droughtRatio: getDroughtRatio(
        champion.lastChampionDate,
        maxDroughtMs,
        now
      ),
    }));

    if (sortMode === "stars") {
      return [...base].sort(
        (a, b) => b.titles - a.titles || b.droughtRatio - a.droughtRatio
      );
    }

    return base;
  }, [champions, now, aggregates, maxDroughtMs, sortMode]);

  if (rankedChampions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="ranking-title">
      <div className={styles.header}>
        <h2 className={styles.sectionTitle} id="ranking-title">
          {t("rankingTitle")}
        </h2>
        <div className={styles.sortToggle}>
          <button
            className={
              sortMode === "drought" ? styles.sortActive : styles.sortButton
            }
            onClick={() => setSortMode("drought")}
            type="button"
          >
            {t("sortByDrought")}
          </button>
          <button
            className={
              sortMode === "stars" ? styles.sortActive : styles.sortButton
            }
            onClick={() => setSortMode("stars")}
            type="button"
          >
            {t("sortByStars")}
          </button>
        </div>
      </div>
      <ul className={styles.rankingList}>
        {rankedChampions.map((champion, index) => (
          <li
            key={champion.slug}
            className={`${styles.rankingItem} ${
              selectedSlug === champion.slug ? styles.highlighted : ""
            }`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className={styles.rank}>#{index + 1}</span>
            <CountryFlag
              champion={champion}
              imageClassName={styles.countryFlag}
              fallbackClassName={styles.countryFlagFallback}
            />
            <div className={styles.details}>
              <span className={styles.countryName}>{champion.displayName}</span>
              <div
                className={styles.droughtBar}
                role="img"
                aria-label={t("droughtBar")}
              >
                <span
                  className={styles.droughtFill}
                  style={{ width: `${champion.droughtRatio * 100}%` }}
                />
              </div>
            </div>
            <div className={styles.badges}>
              <span className={styles.starsBadge}>
                {"★".repeat(champion.titles)}
              </span>
              <span className={styles.durationBadge}>
                {formatDuration(champion.duration, false, locale)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
