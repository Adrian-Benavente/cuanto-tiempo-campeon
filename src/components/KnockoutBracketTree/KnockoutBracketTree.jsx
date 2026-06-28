import React, { useMemo } from "react";
import { Bracket } from "bracketkit";
import { useLocale } from "../../context/LocaleContext";
import {
  buildBracketkitRounds,
  hasKnockoutBracket,
} from "../../utils/knockoutBracket";
import panelStyles from "../QualificationPanel/QualificationPanel.module.css";
import BracketMatchCell from "./BracketMatchCell";
import styles from "./KnockoutBracketTree.module.css";

export default function KnockoutBracketTree({ bracket }) {
  const { t } = useLocale();

  const rounds = useMemo(() => buildBracketkitRounds(bracket), [bracket]);

  if (!hasKnockoutBracket(bracket)) {
    return null;
  }

  return (
    <section className={panelStyles.panel} aria-labelledby="knockout-bracket-title">
      <h2 className={panelStyles.title} id="knockout-bracket-title">
        {t("knockoutBracketTitle")}
      </h2>

      <div className={styles.scrollWrap}>
        <Bracket
          className={styles.bracketRoot}
          rounds={rounds}
          matchWidth={64}
          connectorWidth={28}
          matchGap={6}
          renderRoundHeader={(round) => (
            <span className={styles.roundLabel}>{round.shortLabel}</span>
          )}
          renderMatch={(match) => <BracketMatchCell match={match} />}
        />
      </div>
    </section>
  );
}
