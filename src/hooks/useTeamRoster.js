import { useEffect, useState } from "react";

function getCurrentWorldCupYear(now = new Date()) {
  return now.getUTCFullYear() >= 2026 ? 2026 : null;
}

export default function useTeamRoster(teamSlug) {
  const [roster, setRoster] = useState({
    year: null,
    players: [],
    isLoading: false,
    source: "fallback",
  });

  useEffect(() => {
    const year = getCurrentWorldCupYear();

    if (!teamSlug || !year) {
      setRoster({
        year,
        players: [],
        isLoading: false,
        source: "fallback",
      });
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setRoster((current) => ({
        ...current,
        year,
        isLoading: true,
      }));

      try {
        const response = await fetch(
          `/api/team-roster?team=${encodeURIComponent(teamSlug)}&year=${year}`
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload = await response.json();

        if (!cancelled) {
          setRoster({
            year: payload?.year ?? year,
            players: payload?.players ?? [],
            isLoading: false,
            source: payload?.source ?? "fallback",
          });
        }
      } catch (error) {
        console.warn("Failed to load team roster:", error);

        if (!cancelled) {
          setRoster({
            year,
            players: [],
            isLoading: false,
            source: "fallback",
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [teamSlug]);

  return roster;
}
