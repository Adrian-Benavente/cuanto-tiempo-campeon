import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import fifaRankingSnapshot from "../../data/fifa-world-ranking-2026-snapshot.json";
import {
  buildBestThirdPlaceTable,
  buildFifaRankLookup,
} from "../../utils/bestThirdPlace";
import { formatGoalDifference } from "../../utils/groupStandings";
import styles from "./BestThirdPlaceTable.module.css";

const fifaRankLookup = buildFifaRankLookup(fifaRankingSnapshot);

export default function BestThirdPlaceTable({ fixture }) {
  const { t } = useLocale();

  const { rows, isProjection, hasFairPlayData } = useMemo(
    () =>
      buildBestThirdPlaceTable({
        standings: fixture?.standings,
        matches: fixture?.matches ?? [],
        fifaRankLookup,
        year: fixture?.year,
      }),
    [fixture]
  );

  if (!rows.length) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="best-third-place-title">
      <h2 className={styles.title} id="best-third-place-title">
        {t("bestThirdPlaceTitle")}
      </h2>
      <p className={styles.subtitle}>{t("bestThirdPlaceSubtitle")}</p>
      {isProjection ? (
        <p className={styles.projectionNote}>{t("bestThirdPlaceProjection")}</p>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.caption}>{t("bestThirdPlaceTitle")}</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rankCol}>
                #
              </th>
              <th scope="col">{t("standingsTeam")}</th>
              <th scope="col" className={styles.groupCol}>
                {t("bestThirdPlaceGroupShort")}
              </th>
              <th scope="col" className={styles.statCol}>
                {t("standingsPlayed")}
              </th>
              <th scope="col" className={styles.statCol}>
                {t("standingsGoalDiff")}
              </th>
              <th scope="col" className={styles.statCol}>
                {t("standingsPoints")}
              </th>
              {hasFairPlayData ? (
                <th scope="col" className={styles.statCol}>
                  {t("bestThirdPlaceFairPlay")}
                </th>
              ) : null}
              <th scope="col" className={styles.statusCol}>
                {t("bestThirdPlaceStatus")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.group}-${row.team}`}
                className={row.qualifies ? styles.qualifiedRow : styles.eliminatedRow}
              >
                <td className={styles.rankCol}>{row.rank}</td>
                <th scope="row" className={styles.teamCell}>
                  {row.team}
                </th>
                <td className={styles.groupCol}>{row.group}</td>
                <td className={styles.statCol}>{row.played ?? 0}</td>
                <td className={styles.statCol}>
                  {formatGoalDifference(row.goalDifference)}
                </td>
                <td className={styles.statCol}>{row.points ?? 0}</td>
                {hasFairPlayData ? (
                  <td className={styles.statCol}>{row.fairPlay}</td>
                ) : null}
                <td className={styles.statusCol}>
                  <span
                    className={
                      row.qualifies ? styles.qualifiedBadge : styles.eliminatedBadge
                    }
                  >
                    {row.qualifies
                      ? t("bestThirdPlaceQualified")
                      : t("bestThirdPlaceEliminated")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
