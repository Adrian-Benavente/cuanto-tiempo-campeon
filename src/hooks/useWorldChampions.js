import { useCallback, useEffect, useState } from "react";
import { fallbackChampions } from "../api/world-champions-fallback";

const API_URL = "/api/world-champions";

export default function useWorldChampions() {
  const [champions, setChampions] = useState(fallbackChampions);
  const [source, setSource] = useState("fallback");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadChampions = useCallback(async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const payload = await response.json();

      if (
        !Array.isArray(payload?.champions) ||
        payload.champions.length === 0
      ) {
        throw new Error("API returned an empty champions payload");
      }

      setChampions(payload.champions);
      setSource(payload.source ?? "zafronix");
      setError(null);
    } catch (fetchError) {
      console.warn("Using fallback world champions data:", fetchError);
      setChampions(fallbackChampions);
      setSource("fallback");
      setError(fetchError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChampions();
  }, [loadChampions]);

  return {
    champions,
    source,
    isLoading,
    error,
    lastChampion: champions[0] ?? null,
  };
}
