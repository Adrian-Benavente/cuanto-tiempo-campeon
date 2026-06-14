import React from "react";
import { useLocale } from "../../context/LocaleContext";
import {
  formatGoalDifference,
  getStandingsForGroup,
  hasStandingsActivity,
} from "../../utils/groupStandings";
import styles from "./WorldCupFixture.module.css";

export default function GroupStandingsTable({ standings, stageKey, groupLabel }) {
  const { t } = useLocale();
  const rows = getStandingsForGroup(standings, stageKey);

  if (!hasStandingsActivity(rows)) {
    return null;
  }

  return (
    <div className={styles.standingsWrap}>
      <table className={styles.standingsTable}>
        <caption className={styles.standingsCaption}>
          {groupLabel}
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.standingsPosCol}>
              #
            </th>
            <th scope="col">{t("standingsTeam")}</th>
            <th scope="col" className={styles.standingsStatCol}>
              {t("standingsPlayed")}
            </th>
            <th scope="col" className={styles.standingsStatCol}>
              {t("standingsGoalDiff")}
            </th>
            <th scope="col" className={styles.standingsStatCol}>
              {t("standingsPoints")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.team}
              className={row.advanced ? styles.standingsAdvancedRow : undefined}
              title={row.advanced ? t("standingsAdvanced") : undefined}
            >
              <td className={styles.standingsPosCol}>{row.position ?? "—"}</td>
              <th scope="row" className={styles.standingsTeamCell}>
                {row.team}
              </th>
              <td className={styles.standingsStatCol}>{row.played ?? 0}</td>
              <td className={styles.standingsStatCol}>
                {formatGoalDifference(row.goalDifference)}
              </td>
              <td className={styles.standingsPointsCol}>{row.points ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
