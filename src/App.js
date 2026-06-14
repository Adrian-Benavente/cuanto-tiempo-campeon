import React from "react";
import WorldChampionsList from "./components/WorldChampionsList/WorldChampionsList";
import "./App.css";
import ChampionBackground from "./components/ChampionBackground/ChampionBackground";
import Header from "./components/Header/Header";
import { WorldChampionsProvider } from "./context/WorldChampionsContext";

const App = () => {
  return (
    <WorldChampionsProvider>
      <ChampionBackground />
      <Header />
      <main className="main-container">
        <div className="inner">
          <WorldChampionsList />
        </div>
      </main>
      <footer>
        <a
          className="repo-link"
          href="https://github.com/Adrian-Benavente/cuanto-tiempo-campeon"
          target="_blank"
          rel="noreferrer"
        >
          <span className="sr-only">Repositorio en Github</span>
        </a>
      </footer>
    </WorldChampionsProvider>
  );
};

export default App;
