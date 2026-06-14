import { useEffect, useState } from "react";

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
    mode: "recent",
    year: 2022,
    matches: [],
    source: "fallback",
  });

  const championYear = getYearFromDate(lastChampionDate);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [factsPayload, aggregatesPayload, tournamentsPayload, wc2026Payload] =
          await Promise.all([
            fetchJson(`/api/champion-facts?year=${championYear}`),
            fetchJson("/api/champion-aggregates"),
            fetchJson("/api/tournaments-history"),
            fetchJson("/api/world-cup-2026"),
          ]);

        if (!cancelled) {
          setFacts(factsPayload);
          setAggregates(aggregatesPayload?.aggregates ?? []);
          setTournaments(tournamentsPayload?.tournaments ?? []);
          setWorldCup2026(wc2026Payload);
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
            mode: payload?.mode ?? "recent",
            year: payload?.year ?? 2022,
            matches: payload?.matches ?? [],
            source: payload?.source ?? "fallback",
          });
        }
      } catch (error) {
        console.warn("Failed to load live matches:", error);
      }
    }

    loadLive();
    const interval = setInterval(loadLive, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { facts, aggregates, tournaments, worldCup2026, liveMatches };
}
