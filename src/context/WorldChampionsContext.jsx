import React, { createContext, useContext } from "react";
import useWorldChampions from "../hooks/useWorldChampions";

const WorldChampionsContext = createContext(null);

export function WorldChampionsProvider({ children }) {
  const value = useWorldChampions();

  return (
    <WorldChampionsContext.Provider value={value}>
      {children}
    </WorldChampionsContext.Provider>
  );
}

export function useWorldChampionsContext() {
  const context = useContext(WorldChampionsContext);

  if (!context) {
    throw new Error(
      "useWorldChampionsContext must be used within WorldChampionsProvider"
    );
  }

  return context;
}
