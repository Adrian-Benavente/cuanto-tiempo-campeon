import React from "react";
import CountryFlag from "../CountryFlag/CountryFlag";
import styles from "./KnockoutBracketTree.module.css";

export default function BracketTeamRow({ team, tbdLabel }) {
  if (team.isTbd) {
    return (
      <div className={styles.teamRow} aria-label={tbdLabel}>
        <span className={styles.tbdSlot} aria-hidden="true" />
      </div>
    );
  }

  const champion = {
    slug: team.meta?.slug,
    countryCode: team.meta?.countryCode,
    displayName: team.meta?.displayName ?? team.apiName,
  };

  return (
    <div
      className={`${styles.teamRow} ${team.won ? styles.teamWon : ""} ${
        team.lost ? styles.teamLost : ""
      }`}
    >
      <CountryFlag
        champion={champion}
        imageClassName={styles.flag}
        fallbackClassName={styles.flagFallback}
      />
      <span className={styles.teamCode}>{team.fifaCode}</span>
      {team.score != null ? (
        <span className={styles.teamScore} aria-hidden="true">
          {team.score}
        </span>
      ) : null}
    </div>
  );
}
