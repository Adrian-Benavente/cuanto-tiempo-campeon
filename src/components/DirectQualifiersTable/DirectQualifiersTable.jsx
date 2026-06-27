import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import { buildDirectQualifiersTable } from "../../utils/directQualifiers";
import { formatGoalDifference } from "../../utils/groupStandings";
import styles from "../QualificationPanel/QualificationPanel.module.css";

export default function DirectQualifiersTable({ fixture }) {
  const { t } = useLocale();

  const { rows } = useMemo(
    () =>
      buildDirectQualifiersTable({
        standings: fixture?.standings,
        year: fixture?.year,
      }),
    [fixture]
  );

  if (!rows.length) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="direct-qualifiers-title">
      <h2 className={styles.title} id="direct-qualifiers-title">
        {t("directQualifiersTitle")}
      </h2>
      <p className={styles.subtitle}>{t("directQualifiersSubtitle")}</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.caption}>{t("directQualifiersTitle")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("standingsTeam")}</th>
              <th scope="col" className={styles.groupCol}>
                {t("bestThirdPlaceGroupShort")}
              </th>
              <th scope="col" className={styles.positionCol}>
                {t("directQualifiersPosition")}
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.group}-${row.team}`} className={styles.qualifiedRow}>
                <th scope="row" className={styles.teamCell}>
                  {row.team}
                </th>
                <td className={styles.groupCol}>{row.group}</td>
                <td className={styles.positionCol}>
                  {t("directQualifiersPositionValue", { position: row.position })}
                </td>
                <td className={styles.statCol}>{row.played ?? 0}</td>
                <td className={styles.statCol}>
                  {formatGoalDifference(row.goalDifference)}
                </td>
                <td className={styles.statCol}>{row.points ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
