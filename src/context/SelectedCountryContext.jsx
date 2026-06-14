import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NEVER_WON_TEAMS } from "../data/teams-fallback";
import { getParam, updateSearchParams } from "../utils/urlParams";
import { useWorldChampionsContext } from "./WorldChampionsContext";

const STORAGE_KEY = "selectedCountrySlug";
const SelectedCountryContext = createContext(null);

function findCountryBySlug(slug, champions) {
  if (!slug) {
    return null;
  }

  const champion = champions.find((entry) => entry.slug === slug);
  if (champion) {
    return { ...champion, hasWon: true, isChampion: true };
  }

  const neverWon = NEVER_WON_TEAMS.find((entry) => entry.slug === slug);
  if (neverWon) {
    return neverWon;
  }

  return null;
}

export function SelectedCountryProvider({ children }) {
  const { champions } = useWorldChampionsContext();
  const [selectedSlug, setSelectedSlugState] = useState(() => {
    return getParam("pais") || localStorage.getItem(STORAGE_KEY) || "";
  });

  const setSelectedSlug = useCallback((slug) => {
    setSelectedSlugState(slug);
    if (slug) {
      localStorage.setItem(STORAGE_KEY, slug);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    updateSearchParams({ pais: slug || null });
  }, []);

  useEffect(() => {
    const fromUrl = getParam("pais");
    if (fromUrl && fromUrl !== selectedSlug) {
      setSelectedSlugState(fromUrl);
      localStorage.setItem(STORAGE_KEY, fromUrl);
    }
  }, [selectedSlug]);

  const selectedCountry = useMemo(
    () => findCountryBySlug(selectedSlug, champions),
    [selectedSlug, champions]
  );

  const pickerOptions = useMemo(() => {
    const championsOptions = champions.map((champion) => ({
      slug: champion.slug,
      displayName: champion.displayName,
      countryCode: champion.countryCode,
      group: "champions",
    }));

    const neverWonOptions = NEVER_WON_TEAMS.map((team) => ({
      slug: team.slug,
      displayName: team.displayName,
      countryCode: team.countryCode,
      group: "neverWon",
    }));

    return [...championsOptions, ...neverWonOptions].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, "es")
    );
  }, [champions]);

  const value = useMemo(
    () => ({
      selectedSlug,
      selectedCountry,
      pickerOptions,
      setSelectedSlug,
    }),
    [selectedSlug, selectedCountry, pickerOptions, setSelectedSlug]
  );

  return (
    <SelectedCountryContext.Provider value={value}>
      {children}
    </SelectedCountryContext.Provider>
  );
}

export function useSelectedCountry() {
  const context = useContext(SelectedCountryContext);

  if (!context) {
    throw new Error(
      "useSelectedCountry must be used within SelectedCountryProvider"
    );
  }

  return context;
}
