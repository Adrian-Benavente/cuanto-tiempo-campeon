import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useLocale } from "../../context/LocaleContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import {
  getLiveCountdownParts,
  padCountdownValue,
} from "../../utils/formatDuration";
import { getTitlesForSlug } from "../../utils/championTitles";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./HeroChampion.module.css";

export default function HeroChampion({ aggregates = [] }) {
  const { t } = useLocale();
  const { lastChampion } = useWorldChampionsContext();
  const now = useLiveNow();

  const titles = useMemo(() => {
    if (!lastChampion) {
      return 0;
    }

    return getTitlesForSlug(lastChampion.slug, aggregates);
  }, [lastChampion, aggregates]);

  const countdownUnits = useMemo(
    () => [
      { key: "days", label: t("days") },
      { key: "hours", label: t("hours") },
      { key: "minutes", label: t("minutes") },
      { key: "seconds", label: t("seconds") },
    ],
    [t]
  );

  const countdown = useMemo(() => {
    if (!lastChampion) {
      return null;
    }

    return getLiveCountdownParts(
      new Date(lastChampion.lastChampionDate),
      now
    );
  }, [lastChampion, now]);

  if (!lastChampion || !countdown) {
    return null;
  }

  const sinceText = intervalToDuration({
    start: new Date(lastChampion.lastChampionDate),
    end: now,
  });

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.flagWrapper}>
        <span className={styles.badge}>{t("currentChampionBadge")}</span>
        <CountryFlag
          champion={lastChampion}
          imageClassName={styles.championFlag}
          fallbackClassName={styles.championFlagFallback}
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title} id="hero-title">
          {t("currentChampionTitle", { country: lastChampion.displayName })}
        </h1>
        <p className={styles.titlesRow} aria-label={t("stars", { count: titles })}>
          <span aria-hidden="true" className={styles.starsBadge}>
            {"★".repeat(titles)}
          </span>
          <span className={styles.titlesLabel}>{t("stars", { count: titles })}</span>
        </p>
        <p className={styles.subtitle}>{t("subtitle")}</p>

        <div
          className={styles.countdown}
          role="timer"
          aria-live="polite"
          aria-label={`${sinceText.years ?? 0} ${sinceText.months ?? 0} ${sinceText.days ?? 0}`}
        >
          {countdownUnits.map(({ key, label }) => (
            <div className={styles.countdownUnit} key={key}>
              <span className={styles.countdownValue}>
                {padCountdownValue(countdown[key])}
              </span>
              <span className={styles.countdownLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
