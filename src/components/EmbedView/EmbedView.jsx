import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import {
  getLiveCountdownParts,
  padCountdownValue,
} from "../../utils/formatDuration";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./EmbedView.module.css";

export default function EmbedView() {
  const { t } = useLocale();
  const { selectedCountry } = useSelectedCountry();
  const { lastChampion } = useWorldChampionsContext();
  const now = useLiveNow();

  const displayCountry = selectedCountry ?? lastChampion;

  const countdown = useMemo(() => {
    if (!displayCountry?.lastChampionDate) {
      return null;
    }

    return getLiveCountdownParts(
      new Date(displayCountry.lastChampionDate),
      now
    );
  }, [displayCountry, now]);

  if (!displayCountry) {
    return null;
  }

  if (!displayCountry.lastChampionDate) {
    return (
      <div className={styles.embed}>
        <CountryFlag
          champion={displayCountry}
          imageClassName={styles.flag}
          fallbackClassName={styles.flagFallback}
        />
        <p className={styles.message}>
          {t("myTeamNeverWon", { country: displayCountry.displayName })}
        </p>
      </div>
    );
  }

  const duration = intervalToDuration({
    start: new Date(displayCountry.lastChampionDate),
    end: now,
  });

  const isCurrentChampion = lastChampion?.slug === displayCountry.slug;

  return (
    <div className={styles.embed}>
      <CountryFlag
        champion={displayCountry}
        imageClassName={styles.flag}
        fallbackClassName={styles.flagFallback}
      />
      <p className={styles.message}>
        {isCurrentChampion
          ? t("myTeamCurrentChampion", { country: displayCountry.displayName })
          : t("myTeamDrought", {
              country: displayCountry.displayName,
              duration: `${duration.years ?? 0}a ${duration.months ?? 0}m ${duration.days ?? 0}d`,
            })}
      </p>
      {countdown && (
        <p className={styles.countdown}>
          {padCountdownValue(countdown.days)}d {padCountdownValue(countdown.hours)}h{" "}
          {padCountdownValue(countdown.minutes)}m
        </p>
      )}
    </div>
  );
}
