import { useEffect, useRef, useState } from "react";
import { detectScoreChange, getMatchKey } from "../utils/liveMatchData";

const FLASH_DURATION_MS = 1200;

function buildScoreSnapshot(matches = []) {
  return matches.reduce((snapshot, match, index) => {
    const key = getMatchKey(match, index);
    snapshot[key] = {
      homeScore: match?.homeScore ?? match?.score?.home ?? null,
      awayScore: match?.awayScore ?? match?.score?.away ?? null,
    };
    return snapshot;
  }, {});
}

export default function useLiveScoreHighlights(matches = [], enabled = false) {
  const [highlights, setHighlights] = useState({});
  const previousSnapshotRef = useRef({});
  const timeoutsRef = useRef({});

  useEffect(() => {
    if (!enabled) {
      previousSnapshotRef.current = {};
      setHighlights({});
      return undefined;
    }

    const previousSnapshot = previousSnapshotRef.current;
    const nextHighlights = {};

    matches.forEach((match, index) => {
      const key = getMatchKey(match, index);
      const previousMatch = previousSnapshot[key];
      const { homeChanged, awayChanged } = detectScoreChange(
        previousMatch
          ? {
              homeScore: previousMatch.homeScore,
              awayScore: previousMatch.awayScore,
            }
          : null,
        match
      );

      if (homeChanged || awayChanged) {
        nextHighlights[key] = { homeFlash: homeChanged, awayFlash: awayChanged };
      }
    });

    if (Object.keys(nextHighlights).length > 0) {
      setHighlights((current) => ({ ...current, ...nextHighlights }));

      Object.entries(nextHighlights).forEach(([key, value]) => {
        if (timeoutsRef.current[key]) {
          clearTimeout(timeoutsRef.current[key]);
        }

        timeoutsRef.current[key] = setTimeout(() => {
          setHighlights((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
          delete timeoutsRef.current[key];
        }, FLASH_DURATION_MS);
      });
    }

    previousSnapshotRef.current = buildScoreSnapshot(matches);

    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
    };
  }, [matches, enabled]);

  return highlights;
}
