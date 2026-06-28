import React from "react";
import { useLocale } from "../../context/LocaleContext";
import BracketTeamRow from "./BracketTeamRow";
import styles from "./KnockoutBracketTree.module.css";

export default function BracketMatchCell({ match }) {
  const { t } = useLocale();
  const tbdLabel = t("knockoutBracketTbd");

  return (
    <div className={styles.matchCell}>
      <BracketTeamRow team={match.home} tbdLabel={tbdLabel} />
      <BracketTeamRow team={match.away} tbdLabel={tbdLabel} />
    </div>
  );
}
