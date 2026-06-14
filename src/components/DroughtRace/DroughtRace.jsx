import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useLocale } from "../../context/LocaleContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import { formatDuration } from "../../utils/formatDuration";
import styles from "./DroughtRace.module.css";

export default function DroughtRace() {
  const { locale, t } = useLocale();
  const { champions } = useWorldChampionsContext();
  const now = useLiveNow();

  const entries = useMemo(
    () =>
      champions.map((champion) => ({
        ...champion,
        duration: intervalToDuration({
          start: new Date(champion.lastChampionDate),
          end: now,
        }),
      })),
    [champions, now]
  );

  return (
    <section className={styles.panel} aria-labelledby="drought-race-title">
      <h2 className={styles.title} id="drought-race-title">
        {t("droughtRace")}
      </h2>
      <p className={styles.subtitle}>{t("droughtRaceSubtitle")}</p>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li className={styles.item} key={entry.slug}>
            <span className={styles.name}>{entry.displayName}</span>
            <span className={styles.duration}>
              {formatDuration(entry.duration, false, locale)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
