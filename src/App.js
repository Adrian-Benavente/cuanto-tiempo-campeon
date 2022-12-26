import React from "react";
import WorldChampionsList from "./components/WorldChampionsList/WorldChampionsList";
import "./App.css";
import Header from "./components/Header/Header";

const App = () => {
  return (
    <>
      <Header />
      <main className="main-container">
        <div className="inner">
          <WorldChampionsList />
        </div>
      </main>
      <footer>
        <a
          aria-label="Repositorio en Github"
          className="repo-link"
          href="https://github.com/Adrian-Benavente/cuanto-tiempo-campeon"
          target="_blank"
          rel="noreferrer"
        ></a>
      </footer>
    </>
  );
};

export default App;
