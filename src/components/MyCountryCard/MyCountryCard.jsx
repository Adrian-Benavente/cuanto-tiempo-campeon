import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import { formatDuration } from "../../utils/formatDuration";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./MyCountryCard.module.css";

export default function MyCountryCard() {
  const { locale, t } = useLocale();
  const { selectedCountry } = useSelectedCountry();
  const { lastChampion } = useWorldChampionsContext();
  const now = useLiveNow();

  const message = useMemo(() => {
    if (!selectedCountry) {
      return null;
    }

    if (selectedCountry.hasWon === false) {
      return t("myTeamNeverWon", { country: selectedCountry.displayName });
    }

    if (lastChampion?.slug === selectedCountry.slug) {
      return t("myTeamCurrentChampion", {
        country: selectedCountry.displayName,
      });
    }

    const duration = intervalToDuration({
      start: new Date(selectedCountry.lastChampionDate),
      end: now,
    });

    return t("myTeamDrought", {
      country: selectedCountry.displayName,
      duration: formatDuration(duration, false, locale),
    });
  }, [selectedCountry, lastChampion, now, t, locale]);

  if (!selectedCountry || !message) {
    return null;
  }

  return (
    <section className={styles.card} aria-live="polite">
      <CountryFlag
        champion={selectedCountry}
        imageClassName={styles.flag}
        fallbackClassName={styles.flagFallback}
      />
      <p className={styles.message}>{message}</p>
    </section>
  );
}
