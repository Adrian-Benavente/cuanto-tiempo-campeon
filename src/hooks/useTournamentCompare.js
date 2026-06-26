import { useCallback, useEffect, useRef, useState } from "react";

export function makeCompareCacheKey(years = []) {
  return [...years].sort((left, right) => left - right).join("-");
}

async function fetchCompare(years) {
  const response = await fetch(
    `/api/compare?years=${years.map((year) => encodeURIComponent(year)).join(",")}`
  );

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export default function useTournamentCompare() {
  const [selectedYears, setSelectedYears] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [status, setStatus] = useState("idle");
  const cacheRef = useRef(new Map());

  const clearSelection = useCallback(() => {
    setSelectedYears([]);
    setComparison(null);
    setStatus("idle");
  }, []);

  const toggleYear = useCallback((year) => {
    setSelectedYears((current) => {
      if (current.includes(year)) {
        return current.filter((value) => value !== year);
      }

      if (current.length === 0) {
        return [year];
      }

      if (current.length === 1) {
        return [...current, year];
      }

      return [current[1], year];
    });
  }, []);

  useEffect(() => {
    if (selectedYears.length !== 2) {
      setComparison(null);
      setStatus("idle");
      return;
    }

    const cacheKey = makeCompareCacheKey(selectedYears);
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setComparison(cached);
      setStatus("success");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setComparison(null);

    fetchCompare(selectedYears)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        cacheRef.current.set(cacheKey, payload);
        setComparison(payload);
        setStatus(payload?.rows?.length ? "success" : "error");
      })
      .catch(() => {
        if (!cancelled) {
          setComparison(null);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYears]);

  return {
    selectedYears,
    toggleYear,
    clearSelection,
    comparison,
    status,
    isLoading: status === "loading",
  };
}
