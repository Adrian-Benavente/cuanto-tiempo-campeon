import React from "react";
import ChampionBackground from "./components/ChampionBackground/ChampionBackground";
import Footer from "./components/Footer/Footer";
import HeroChampion from "./components/HeroChampion/HeroChampion";
import LoadingSkeleton from "./components/LoadingSkeleton/LoadingSkeleton";
import WorldChampionsList from "./components/WorldChampionsList/WorldChampionsList";
import {
  useWorldChampionsContext,
  WorldChampionsProvider,
} from "./context/WorldChampionsContext";
import "./App.css";

function AppContent() {
  const { isLoading, source } = useWorldChampionsContext();

  return (
    <>
      <ChampionBackground />
      <div className="appShell">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <HeroChampion />
            {source === "fallback" && (
              <p className="fallbackNotice" role="status">
                Datos locales — API no disponible
              </p>
            )}
            <main className="mainPanel">
              <WorldChampionsList />
            </main>
          </>
        )}
        <Footer />
      </div>
    </>
  );
}

const App = () => {
  return (
    <WorldChampionsProvider>
      <AppContent />
    </WorldChampionsProvider>
  );
};

export default App;
