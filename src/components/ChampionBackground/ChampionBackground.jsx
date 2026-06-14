import { useWorldChampionsContext } from "../../context/WorldChampionsContext";
import useChampionBackground from "../../hooks/useChampionBackground";

export default function ChampionBackground() {
  const { lastChampion } = useWorldChampionsContext();
  useChampionBackground(lastChampion);

  return null;
}
