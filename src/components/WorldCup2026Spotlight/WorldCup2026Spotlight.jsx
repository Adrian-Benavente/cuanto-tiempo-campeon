import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import { buildWorldCupSpotlights } from "../../utils/worldCupSpotlight";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./WorldCup2026Spotlight.module.css";

export default function WorldCup2026Spotlight({
  aggregates = [],
  tournaments = [],
}) {
  const { locale, t } = useLocale();
  const { champions, lastChampion } = useWorldChampionsContext();
  const now = useLiveNow();

  const spotlights = useMemo(
    () =>
      buildWorldCupSpotlights({
        champions,
        lastChampion,
        aggregates,
        tournaments,
        now,
        locale,
      }),
    [champions, lastChampion, aggregates, tournaments, now, locale]
  );

  if (!spotlights.length) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="spotlight-title">
      <h2 className={styles.title} id="spotlight-title">
        {t("spotlightTitle")}
      </h2>
      <p className={styles.subtitle}>{t("spotlightSubtitle")}</p>
      <ul className={styles.grid}>
        {spotlights.map((spotlight) => (
          <li className={styles.card} key={spotlight.id}>
            <span className={styles.label}>{t(spotlight.labelKey)}</span>
            {spotlight.champion ? (
              <CountryFlag
                champion={spotlight.champion}
                imageClassName={styles.flag}
                fallbackClassName={styles.flagFallback}
              />
            ) : null}
            <p className={styles.headline}>
              {t(spotlight.headlineKey, spotlight.vars)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
