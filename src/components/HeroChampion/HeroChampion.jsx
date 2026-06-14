import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import {
  getLiveCountdownParts,
  padCountdownValue,
} from "../../utils/formatDuration";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./HeroChampion.module.css";

const COUNTDOWN_UNITS = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
];

export default function HeroChampion() {
  const { lastChampion } = useWorldChampionsContext();
  const now = useLiveNow();

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
        <span className={styles.badge}>Campeón actual</span>
        <CountryFlag
          champion={lastChampion}
          imageClassName={styles.championFlag}
          fallbackClassName={styles.championFlagFallback}
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title} id="hero-title">
          {lastChampion.displayName} es el último campeón mundial
        </h1>
        <p className={styles.subtitle}>
          ¿Cuándo fue la última vez que saliste campeón del mundo?
        </p>

        <div
          className={styles.countdown}
          role="timer"
          aria-live="polite"
          aria-label={`Tiempo desde el título: ${sinceText.years ?? 0} años, ${sinceText.months ?? 0} meses, ${sinceText.days ?? 0} días`}
        >
          {COUNTDOWN_UNITS.map(({ key, label }) => (
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
