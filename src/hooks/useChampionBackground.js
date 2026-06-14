import { useEffect } from "react";
import { resolveFlagCode } from "../utils/countryAssets";
import { getDominantFlagColors } from "../utils/extractFlagColors";
import { buildFlagGradient, getDefaultGradient } from "../utils/flagGradient";

export default function useChampionBackground(lastChampion) {
  useEffect(() => {
    let isCancelled = false;

    async function applyBackground() {
      if (!lastChampion) {
        document.body.style.background = getDefaultGradient();
        return;
      }

      const flagCode = resolveFlagCode(lastChampion);

      if (!flagCode) {
        document.body.style.background = getDefaultGradient();
        return;
      }

      try {
        const colors = await getDominantFlagColors(flagCode);

        if (isCancelled) {
          return;
        }

        document.body.style.background = buildFlagGradient(colors);
      } catch (error) {
        console.warn("Failed to build champion background:", error);

        if (!isCancelled) {
          document.body.style.background = getDefaultGradient();
        }
      }
    }

    applyBackground();

    return () => {
      isCancelled = true;
      document.body.style.background = getDefaultGradient();
    };
  }, [lastChampion]);
}
