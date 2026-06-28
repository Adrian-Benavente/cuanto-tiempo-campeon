import React from "react";
import ChampionBackground from "./components/ChampionBackground/ChampionBackground";
import ChampionFacts from "./components/ChampionFacts/ChampionFacts";
import CountryPicker from "./components/CountryPicker/CountryPicker";
import DroughtMilestones from "./components/DroughtMilestones/DroughtMilestones";
import WorldCup2026Spotlight from "./components/WorldCup2026Spotlight/WorldCup2026Spotlight";
import EmbedView from "./components/EmbedView/EmbedView";
import Footer from "./components/Footer/Footer";
import HeroChampion from "./components/HeroChampion/HeroChampion";
import InstallPrompt from "./components/InstallPrompt/InstallPrompt";
import BestThirdPlaceTable from "./components/BestThirdPlaceTable/BestThirdPlaceTable";
import KnockoutBracketTree from "./components/KnockoutBracketTree/KnockoutBracketTree";
import LiveMatchesBanner from "./components/LiveMatchesBanner/LiveMatchesBanner";
import TodayMatchesBanner from "./components/LiveMatchesBanner/TodayMatchesBanner";
import LoadingSkeleton from "./components/LoadingSkeleton/LoadingSkeleton";
import MyCountryCard from "./components/MyCountryCard/MyCountryCard";
import ShareButton from "./components/ShareButton/ShareButton";
import WorldChampionsList from "./components/WorldChampionsList/WorldChampionsList";
import WorldCupCountdown from "./components/WorldCupCountdown/WorldCupCountdown";
import WorldCupFixture from "./components/WorldCupFixture/WorldCupFixture";
import WorldCupTimeline from "./components/WorldCupTimeline/WorldCupTimeline";
import { LocaleProvider, useLocale } from "./context/LocaleContext";
import {
  SelectedCountryProvider,
} from "./context/SelectedCountryContext";
import {
  useWorldChampionsContext,
  WorldChampionsProvider,
} from "./context/WorldChampionsContext";
import useSiteExtras from "./hooks/useSiteExtras";
import { isEmbedMode } from "./utils/urlParams";
import "./App.css";

function PersonalizationToolbar() {
  return (
    <div className="toolbar">
      <ShareButton />
    </div>
  );
}

function MyTeamSection() {
  return (
    <section className="myTeamSection" aria-label="Mi selección">
      <CountryPicker />
      <MyCountryCard />
    </section>
  );
}

function MainExperience() {
  const { t } = useLocale();
  const { isLoading, source, lastChampion } = useWorldChampionsContext();
  const { facts, aggregates, tournaments, worldCup2026, recentMatches, fixture } =
    useSiteExtras(lastChampion?.lastChampionDate);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <WorldCupCountdown worldCup2026={worldCup2026} />
      <div className="matchBannersRow">
        <TodayMatchesBanner
          year={recentMatches.year}
          matches={recentMatches.upcomingToday}
        />
        <LiveMatchesBanner
          year={recentMatches.year}
          matches={recentMatches.matches}
        />
      </div>
      <BestThirdPlaceTable fixture={fixture} />
      <KnockoutBracketTree bracket={fixture?.bracket} />
      <PersonalizationToolbar />
      <HeroChampion aggregates={aggregates} />
      <ChampionFacts facts={facts} />
      <MyTeamSection />
      <DroughtMilestones />
      {source === "fallback" && (
        <p className="fallbackNotice" role="status">
          {t("fallbackNotice")}
        </p>
      )}
      <main className="mainPanel">
        <WorldChampionsList aggregates={aggregates} />
        <WorldCupTimeline tournaments={tournaments} />
        <WorldCup2026Spotlight
          aggregates={aggregates}
          tournaments={tournaments}
        />
      </main>
      <WorldCupFixture fixture={fixture} />
    </>
  );
}

function AppContent() {
  const embedMode = isEmbedMode();

  if (embedMode) {
    return (
      <WorldChampionsProvider>
        <SelectedCountryProvider>
          <EmbedView />
        </SelectedCountryProvider>
      </WorldChampionsProvider>
    );
  }

  return (
    <WorldChampionsProvider>
      <SelectedCountryProvider>
        <ChampionBackground />
        <div className="appShell">
          <InstallPrompt />
          <MainExperience />
          <Footer />
        </div>
      </SelectedCountryProvider>
    </WorldChampionsProvider>
  );
}

const App = () => {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
};

export default App;
