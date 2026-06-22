import React, { useMemo } from "react";
import { intervalToDuration } from "date-fns";
import { useLocale } from "../../context/LocaleContext";
import { useSelectedCountry } from "../../context/SelectedCountryContext";
import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useLiveNow from "../../hooks/useLiveNow";
import useTeamRoster from "../../hooks/useTeamRoster";
import { formatDuration } from "../../utils/formatDuration";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./MyCountryCard.module.css";

function RosterTable({ players, year, t }) {
  if (!players.length) {
    return null;
  }

  return (
    <details className={styles.rosterSection}>
      <summary className={styles.rosterSummary}>
        <span>{t("myTeamRosterTitle", { year })}</span>
        <span className={styles.rosterCount}>{players.length}</span>
      </summary>
      <div className={styles.rosterTableWrap}>
        <table className={styles.rosterTable}>
          <caption className={styles.rosterCaption}>
            {t("myTeamRosterTitle", { year })}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rosterJerseyCol}>
                {t("rosterJersey")}
              </th>
              <th scope="col">{t("rosterPlayer")}</th>
              <th scope="col" className={styles.rosterPositionCol}>
                {t("rosterPosition")}
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={`${player.jersey ?? "na"}-${player.name}`}>
                <td className={styles.rosterJerseyCol}>{player.jersey ?? "—"}</td>
                <th scope="row" className={styles.rosterPlayerCell}>
                  <span className={styles.rosterPlayerName}>{player.name}</span>
                  {player.captain || (player.goals ?? 0) > 0 ? (
                    <span className={styles.rosterPlayerMeta}>
                      {player.captain ? (
                        <span className={styles.rosterCaptain} title={t("rosterCaptain")}>
                          ©
                        </span>
                      ) : null}
                      {(player.goals ?? 0) > 0 ? (
                        <span className={styles.rosterGoals}>
                          {t("rosterGoals", { count: player.goals })}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </th>
                <td className={styles.rosterPositionCol}>
                  {player.position ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function MyCountryCard() {
  const { locale, t } = useLocale();
  const { selectedCountry } = useSelectedCountry();
  const { lastChampion } = useWorldChampionsContext();
  const now = useLiveNow();
  const { year, players, isLoading } = useTeamRoster(selectedCountry?.slug);

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
      <div className={styles.summary}>
        <CountryFlag
          champion={selectedCountry}
          imageClassName={styles.flag}
          fallbackClassName={styles.flagFallback}
        />
        <p className={styles.message}>{message}</p>
      </div>

      {isLoading ? (
        <p className={styles.rosterLoading} role="status">
          {t("rosterLoading")}
        </p>
      ) : (
        <RosterTable players={players} year={year} t={t} />
      )}
    </section>
  );
}
