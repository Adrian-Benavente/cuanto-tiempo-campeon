import { useEffect, useState } from "react";

const RECENT_POLL_MS = 300000;

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
  const [recentMatches, setRecentMatches] = useState({
    mode: "idle",
    year: 2022,
    matches: [],
    source: "fallback",
  });
  const [fixture, setFixture] = useState({
    year: null,
    matches: [],
    standings: { groups: {} },
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
            standings: fixturePayload?.standings ?? { groups: {} },
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

    async function loadRecent() {
      try {
        const payload = await fetchJson("/api/live-matches");
        if (!cancelled) {
          setRecentMatches({
            mode: payload?.mode ?? "idle",
            year: payload?.year ?? 2022,
            matches: payload?.matches ?? [],
            source: payload?.source ?? "fallback",
          });
        }
      } catch (error) {
        console.warn("Failed to load recent matches:", error);
      }
    }

    loadRecent();
    const interval = setInterval(loadRecent, RECENT_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return {
    facts,
    aggregates,
    tournaments,
    worldCup2026,
    recentMatches,
    liveMatches: recentMatches,
    fixture,
  };
}
