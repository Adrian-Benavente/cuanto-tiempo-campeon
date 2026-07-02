import React, { useEffect, useId, useMemo, useRef } from "react";
import { useLocale } from "../../context/LocaleContext";
import { formatMatchDateTime } from "../../utils/formatMatchDateTime";
import { formatMatchStageFromMatch } from "../../utils/formatMatchStage";
import {
  getMatchScoreDisplay,
  getTeamName,
  isMatchInProgress,
} from "../../utils/liveMatchData";
import {
  formatAttendance,
  getMatchDetailSections,
  getTeamSideLabel,
} from "../../utils/matchDetailData";
import { resolveTeamMeta } from "../../utils/teamMeta";
import CountryFlag from "../CountryFlag/CountryFlag";
import MatchScoreLine from "../MatchScoreLine/MatchScoreLine";
import styles from "./MatchDetailModal.module.css";

function formatStatValue(value, decimals = 0) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }

  return String(value);
}

function TeamBadge({ apiName, align }) {
  const meta = resolveTeamMeta(apiName);
  const champion = {
    slug: meta.slug,
    countryCode: meta.countryCode,
    displayName: meta.displayName ?? apiName,
  };

  return (
    <div
      className={`${styles.teamBadge} ${
        align === "away" ? styles.teamBadgeAway : ""
      }`}
    >
      <CountryFlag
        champion={champion}
        imageClassName={styles.teamFlag}
        fallbackClassName={styles.teamFlagFallback}
      />
      <span className={styles.teamName}>{meta.displayName ?? apiName}</span>
    </div>
  );
}

function StatRow({ row, t }) {
  const total = row.homeValue + row.awayValue || 1;
  const homePct = (row.homeValue / total) * 100;

  return (
    <div className={styles.statRow}>
      <div className={styles.statValues}>
        <span>{formatStatValue(row.homeValue, row.decimals)}</span>
        <span className={styles.statLabel}>{t(row.labelKey)}</span>
        <span>{formatStatValue(row.awayValue, row.decimals)}</span>
      </div>
      {row.bar ? (
        <div className={styles.statBarTrack} aria-hidden="true">
          <span
            className={styles.statBarHome}
            style={{ width: `${homePct}%` }}
          />
          <span
            className={styles.statBarAway}
            style={{ width: `${100 - homePct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function LineupList({ players, t }) {
  if (!players.length) {
    return null;
  }

  return (
    <ul className={styles.lineupList}>
      {players.map((player, index) => (
        <li
          className={styles.lineupPlayer}
          key={`${player.player}-${player.number ?? index}`}
        >
          <span className={styles.lineupNumber}>
            {player.number ?? "—"}
          </span>
          <span className={styles.lineupName}>
            {player.player}
            {player.captain ? (
              <span className={styles.lineupCaptain} title={t("rosterCaptain")}>
                (C)
              </span>
            ) : null}
          </span>
          <span className={styles.lineupPosition}>{player.position}</span>
        </li>
      ))}
    </ul>
  );
}

function LineupColumn({ apiName, side, t }) {
  const meta = resolveTeamMeta(apiName);

  return (
    <div className={styles.lineupColumn}>
      <h4 className={styles.lineupTeamTitle}>{meta.displayName ?? apiName}</h4>
      <p className={styles.lineupGroupTitle}>{t("matchDetailStarters")}</p>
      <LineupList players={side.starters} t={t} />
      {side.substitutes.length ? (
        <>
          <p className={styles.lineupGroupTitle}>{t("matchDetailSubstitutes")}</p>
          <LineupList players={side.substitutes} t={t} />
        </>
      ) : null}
    </div>
  );
}

export default function MatchDetailModal({ match, onClose }) {
  const { locale, t } = useLocale();
  const dialogRef = useRef(null);
  const titleId = useId();
  const homeTeam = getTeamName(match?.homeTeam ?? match?.home);
  const awayTeam = getTeamName(match?.awayTeam ?? match?.away);
  const sections = useMemo(
    () => (match ? getMatchDetailSections(match) : null),
    [match]
  );
  const inProgress = match ? isMatchInProgress(match) : false;
  const scoreDisplay = match ? getMatchScoreDisplay(match) : null;
  const stage = match ? formatMatchStageFromMatch(match, locale) : null;
  const dateTime = match ? formatMatchDateTime(match, locale) : null;
  const hasDetailSections =
    sections &&
    (sections.hasGoals ||
      sections.hasStats ||
      sections.hasLineups ||
      sections.hasEvents);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return undefined;
    }

    if (match && !dialog.open) {
      dialog.showModal();
    }

    if (!match && dialog.open) {
      dialog.close();
    }

    return undefined;
  }, [match]);

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={styles.dialog}
      onCancel={handleDialogClose}
      onClose={handleDialogClose}
    >
      {match && sections ? (
        <div className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <h3 className={styles.title} id={titleId}>
                {t("matchDetailTitle")}
              </h3>
              <button
                aria-label={t("matchDetailClose")}
                className={styles.closeButton}
                onClick={handleDialogClose}
                type="button"
              >
                ×
              </button>
            </div>

            <div className={styles.matchHeader}>
              <TeamBadge apiName={homeTeam} />
              <div className={styles.scoreBlock}>
                {inProgress ? (
                  <span className={styles.inProgressLabel}>
                    {t("matchInProgress")}
                  </span>
                ) : scoreDisplay?.homeScore != null &&
                  scoreDisplay?.awayScore != null ? (
                  <MatchScoreLine
                    awayPenalties={scoreDisplay.awayPenalties}
                    awayScore={scoreDisplay.awayScore}
                    homePenalties={scoreDisplay.homePenalties}
                    homeScore={scoreDisplay.homeScore}
                  />
                ) : (
                  <span className={styles.vsLabel}>{t("vs")}</span>
                )}
              </div>
              <TeamBadge align="away" apiName={awayTeam} />
            </div>

            <div className={styles.metaChips}>
              {stage ? <span className={styles.chip}>{stage}</span> : null}
              {dateTime ? (
                <time className={styles.chip} dateTime={dateTime.dateTime}>
                  {dateTime.label}
                </time>
              ) : null}
              {match.extraTime ? (
                <span className={styles.chip}>{t("matchDetailExtraTime")}</span>
              ) : null}
              {sections.hasFormations ? (
                <>
                  {match.formations?.home ? (
                    <span className={styles.chip}>
                      {homeTeam}: {match.formations.home}
                    </span>
                  ) : null}
                  {match.formations?.away ? (
                    <span className={styles.chip}>
                      {awayTeam}: {match.formations.away}
                    </span>
                  ) : null}
                </>
              ) : null}
              {sections.hasVenue ? (
                <span className={styles.chip}>
                  {[match.stadium, match.city].filter(Boolean).join(", ")}
                </span>
              ) : null}
              {sections.hasAttendance ? (
                <span className={styles.chip}>
                  {t("matchDetailAttendance", {
                    count: formatAttendance(match.attendance, locale),
                  })}
                </span>
              ) : null}
              {sections.hasReferee ? (
                <span className={styles.chip}>
                  {t("matchDetailReferee", { name: match.referee.name })}
                </span>
              ) : null}
              {sections.hasWeather ? (
                <span className={styles.chip}>
                  {t("matchDetailWeather", {
                    temp: match.weather.tempC,
                    humidity: match.weather.humidityPct ?? "—",
                  })}
                </span>
              ) : null}
              {sections.hasFairPlay ? (
                <span className={styles.chip}>
                  {t("matchDetailFairPlay", {
                    home: match.fairPlay.home,
                    away: match.fairPlay.away,
                  })}
                </span>
              ) : null}
            </div>
          </header>

          <div className={styles.body}>
            {!hasDetailSections ? (
              <p className={styles.emptyDetails}>{t("matchDetailNoDetails")}</p>
            ) : null}

            {sections.hasGoals ? (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>{t("matchDetailGoals")}</h4>
                <ol className={styles.goalList}>
                  {sections.goals.map((goal, index) => (
                    <li
                      className={styles.goalItem}
                      key={`${goal.minuteLabel}-${goal.scorer}-${index}`}
                    >
                      <span className={styles.goalMinute}>{goal.minuteLabel}</span>
                      <div className={styles.goalBody}>
                        <span className={styles.goalScorer}>
                          {goal.scorer ?? "—"}
                          {goal.type === "penalty" ? (
                            <span className={styles.goalTag}>
                              {t("matchDetailGoalPenalty")}
                            </span>
                          ) : null}
                        </span>
                        {goal.assist ? (
                          <span className={styles.goalAssist}>
                            {t("matchDetailGoalAssist", { player: goal.assist })}
                          </span>
                        ) : null}
                        <span className={styles.goalTeam}>
                          {getTeamSideLabel(goal.team, match, t)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {sections.hasStats ? (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>{t("matchDetailStats")}</h4>
                <div className={styles.statsGrid}>
                  {sections.statRows.map((row) => (
                    <StatRow key={row.key} row={row} t={t} />
                  ))}
                </div>
              </section>
            ) : null}

            {sections.hasEvents ? (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>{t("matchDetailEvents")}</h4>
                <ol className={styles.eventList}>
                  {sections.events.map((event, index) => (
                    <li
                      className={styles.eventItem}
                      key={`${event.kind}-${event.minuteLabel}-${index}`}
                    >
                      <span className={styles.eventMinute}>
                        {event.minuteLabel}
                      </span>
                      <div className={styles.eventBody}>
                        {event.kind === "card" ? (
                          <>
                            <span
                              className={`${styles.cardDot} ${
                                event.color === "red"
                                  ? styles.cardDotRed
                                  : styles.cardDotYellow
                              }`}
                              aria-hidden="true"
                            />
                            <span>
                              {event.player} —{" "}
                              {event.color === "red"
                                ? t("matchDetailCardRed")
                                : t("matchDetailCardYellow")}
                            </span>
                          </>
                        ) : (
                          <span>
                            {t("matchDetailSubstitution", {
                              on: event.on,
                              off: event.off,
                            })}
                          </span>
                        )}
                        <span className={styles.eventTeam}>
                          {getTeamSideLabel(event.team, match, t)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {sections.hasLineups ? (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  {t("matchDetailLineups")}
                </h4>
                <div className={styles.lineupsGrid}>
                  <LineupColumn
                    apiName={homeTeam}
                    side={sections.homeLineup}
                    t={t}
                  />
                  <LineupColumn
                    apiName={awayTeam}
                    side={sections.awayLineup}
                    t={t}
                  />
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
