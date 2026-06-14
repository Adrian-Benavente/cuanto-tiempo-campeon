import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import useLiveNow from "../../hooks/useLiveNow";
import styles from "./WorldCupCountdown.module.css";

export default function WorldCupCountdown({ worldCup2026 }) {
  const { t } = useLocale();
  const now = useLiveNow();

  const daysRemaining = useMemo(() => {
    if (!worldCup2026?.startDate) {
      return null;
    }

    const diffMs = new Date(worldCup2026.startDate) - now;
    return Math.max(0, Math.ceil(diffMs / 86400000));
  }, [worldCup2026, now]);

  if (daysRemaining === null) {
    return null;
  }

  return (
    <section className={styles.banner} aria-live="polite">
      <p className={styles.text}>
        {t("worldCupCountdown", { days: daysRemaining })}
      </p>
      {worldCup2026?.host && (
        <p className={styles.host}>{worldCup2026.host}</p>
      )}
    </section>
  );
}
