import { useEffect, useState } from "react";

const RECENT_POLL_MS = 300000;
const FIXTURE_POLL_MS = 600000;
const WC_2026_START = new Date("2026-06-11T16:00:00.000Z");
const WC_2026_END = new Date("2026-07-19T18:00:00.000Z");

function isWorldCup2026InProgress(now = new Date()) {
  return now >= WC_2026_START && now <= WC_2026_END;
}

function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
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
  const [recentMatches, setRecentMatches] = useState({
    mode: "idle",
    year: 2022,
    matches: [],
    upcomingToday: [],
    source: "fallback",
  });
  const [fixture, setFixture] = useState({
    year: null,
    matches: [],
    standings: { groups: {} },
    bracket: { year: null, rounds: [] },
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
            bracket: fixturePayload?.bracket ?? { year: null, rounds: [] },
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
        const timeZone = getBrowserTimeZone();
        const payload = await fetchJson(
          `/api/live-matches?tz=${encodeURIComponent(timeZone)}`
        );
        if (!cancelled) {
          setRecentMatches({
            mode: payload?.mode ?? "idle",
            year: payload?.year ?? 2022,
            matches: payload?.matches ?? [],
            upcomingToday: payload?.upcomingToday ?? [],
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

  useEffect(() => {
    if (!isWorldCup2026InProgress()) {
      return undefined;
    }

    let cancelled = false;

    async function loadFixture() {
      try {
        const fixturePayload = await fetchJson("/api/world-cup-fixture");

        if (!cancelled) {
          setFixture({
            year: fixturePayload?.year ?? null,
            matches: fixturePayload?.matches ?? [],
            standings: fixturePayload?.standings ?? { groups: {} },
            bracket: fixturePayload?.bracket ?? { year: null, rounds: [] },
            source: fixturePayload?.source ?? "fallback",
          });
        }
      } catch (error) {
        console.warn("Failed to refresh world cup fixture:", error);
      }
    }

    const interval = setInterval(loadFixture, FIXTURE_POLL_MS);

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
