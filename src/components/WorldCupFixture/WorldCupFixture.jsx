import React, { useMemo } from "react";
import { useLocale } from "../../context/LocaleContext";
import { groupMatchesByStage } from "../../utils/fixtureData";
import { formatMatchDateTime } from "../../utils/formatMatchDateTime";
import { isGroupStageKey } from "../../utils/groupStandings";
import { getMatchScores } from "../../utils/liveMatchData";
import { getMatchSideDisplayName } from "../../utils/matchTeams";
import GroupStandingsTable from "./GroupStandingsTable";
import scoreboardStyles from "../LiveMatchesBanner/LiveMatchesBanner.module.css";
import styles from "./WorldCupFixture.module.css";

function FixtureMatchCard({ match }) {
  const { locale, t } = useLocale();
  const tbdLabel = t("fixtureTbd");
  const home = getMatchSideDisplayName(match, "home", tbdLabel);
  const away = getMatchSideDisplayName(match, "away", tbdLabel);
  const { homeScore, awayScore } = getMatchScores(match);
  const hasScore = homeScore != null && awayScore != null;
  const formattedDateTime = formatMatchDateTime(match, locale);

  return (
    <article className={scoreboardStyles.recentCard}>
      {formattedDateTime ? (
        <div className={styles.matchMeta}>
          <time
            className={scoreboardStyles.recentCardDate}
            dateTime={formattedDateTime.dateTime}
          >
            {formattedDateTime.label}
          </time>
        </div>
      ) : null}

      <div className={scoreboardStyles.scoreboard}>
        <span
          className={`${scoreboardStyles.teamName} ${
            home.isPlaceholder ? styles.placeholderTeam : ""
          }`}
        >
          {home.name}
        </span>
        <div className={scoreboardStyles.scoreCenter}>
          {hasScore ? (
            <span className={scoreboardStyles.scoreLine}>
              <span className={scoreboardStyles.scoreValue}>{homeScore}</span>
              <span className={scoreboardStyles.scoreSeparator}>-</span>
              <span className={scoreboardStyles.scoreValue}>{awayScore}</span>
            </span>
          ) : (
            <span className={scoreboardStyles.vsLabel}>{t("vs")}</span>
          )}
        </div>
        <span
          className={`${scoreboardStyles.teamName} ${scoreboardStyles.teamNameAway} ${
            away.isPlaceholder ? styles.placeholderTeam : ""
          }`}
        >
          {away.name}
        </span>
      </div>
    </article>
  );
}

export default function WorldCupFixture({ fixture }) {
  const { t, locale } = useLocale();
  const year = fixture?.year;
  const matches = fixture?.matches;
  const standings = fixture?.standings;

  const sections = useMemo(
    () => groupMatchesByStage(matches ?? [], locale),
    [matches, locale]
  );

  if (!year || !matches?.length) {
    return null;
  }

  return (
    <section className={styles.panel} aria-labelledby="fixture-title">
      <h2 className={styles.title} id="fixture-title">
        {t("fixtureTitle", { year })}
      </h2>
      <p className={styles.subtitle}>{t("fixtureSubtitle", { year })}</p>
      <div className={styles.sections}>
        {sections.map((section) => (
          <details className={styles.section} key={section.stageKey}>
            <summary className={styles.sectionSummary}>
              <span>{section.label}</span>
              <span className={styles.sectionCount}>
                {section.matches.length}
              </span>
            </summary>
            {isGroupStageKey(section.stageKey) ? (
              <GroupStandingsTable
                standings={standings}
                stageKey={section.stageKey}
                groupLabel={section.label}
              />
            ) : null}
            <ul className={styles.matchList}>
              {section.matches.map((match, index) => (
                <li key={match.id ?? `${section.stageKey}-${index}`}>
                  <FixtureMatchCard match={match} />
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
