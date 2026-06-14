import { useEffect, useState } from "react";

export const LIVE_POLL_MS = 15000;
export const IDLE_POLL_MS = 300000;

export function getLivePollInterval(mode, liveModeKnown) {
  if (!liveModeKnown || mode === "live") {
    return LIVE_POLL_MS;
  }

  return IDLE_POLL_MS;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function getYearFromDate(isoDate) {
  if (!isoDate) {
    return 2022;
  }

  return new Date(isoDate).getUTCFullYear();
}

export default function useSiteExtras(lastChampionDate) {
  const [facts, setFacts] = useState(null);
  const [aggregates, setAggregates] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [worldCup2026, setWorldCup2026] = useState(null);
  const [liveMatches, setLiveMatches] = useState({
    mode: "idle",
    year: 2022,
    matches: [],
    source: "fallback",
  });
  const [liveModeKnown, setLiveModeKnown] = useState(false);
  const [fixture, setFixture] = useState({
    year: null,
    matches: [],
    source: "fallback",
  });

  const championYear = getYearFromDate(lastChampionDate);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          factsPayload,
          aggregatesPayload,
          tournamentsPayload,
          wc2026Payload,
          fixturePayload,
        ] = await Promise.all([
          fetchJson(`/api/champion-facts?year=${championYear}`),
          fetchJson("/api/champion-aggregates"),
          fetchJson("/api/tournaments-history"),
          fetchJson("/api/world-cup-2026"),
          fetchJson("/api/world-cup-fixture"),
        ]);

        if (!cancelled) {
          setFacts(factsPayload);
          setAggregates(aggregatesPayload?.aggregates ?? []);
          setTournaments(tournamentsPayload?.tournaments ?? []);
          setWorldCup2026(wc2026Payload);
          setFixture({
            year: fixturePayload?.year ?? null,
            matches: fixturePayload?.matches ?? [],
            source: fixturePayload?.source ?? "fallback",
          });
        }
      } catch (error) {
        console.warn("Failed to load site extras:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [championYear]);

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      try {
        const payload = await fetchJson("/api/live-matches");
        if (!cancelled) {
          setLiveMatches({
            mode: payload?.mode ?? "idle",
            year: payload?.year ?? 2022,
            matches: payload?.matches ?? [],
            source: payload?.source ?? "fallback",
          });
          setLiveModeKnown(true);
        }
      } catch (error) {
        console.warn("Failed to load live matches:", error);
      }
    }

    loadLive();
    const pollMs = getLivePollInterval(liveMatches.mode, liveModeKnown);
    const interval = setInterval(loadLive, pollMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveMatches.mode, liveModeKnown]);

  return { facts, aggregates, tournaments, worldCup2026, liveMatches, fixture };
}
