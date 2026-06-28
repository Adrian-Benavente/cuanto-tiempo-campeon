import { useEffect, useState } from "react";

const CONNECTOR_RATIO = 28 / 64;
const MOBILE_BREAKPOINT = 640;
const DEFAULT_MATCH_WIDTH = 64;
const DEFAULT_CONNECTOR_WIDTH = 28;
const MIN_MATCH_WIDTH = 64;
const MAX_MATCH_WIDTH = 140;

export function computeBracketDimensions(containerWidth, roundCount) {
  if (!roundCount || roundCount < 1 || !containerWidth) {
    return {
      matchWidth: DEFAULT_MATCH_WIDTH,
      connectorWidth: DEFAULT_CONNECTOR_WIDTH,
    };
  }

  if (containerWidth <= MOBILE_BREAKPOINT) {
    return {
      matchWidth: DEFAULT_MATCH_WIDTH,
      connectorWidth: DEFAULT_CONNECTOR_WIDTH,
    };
  }

  const divisor = roundCount + (roundCount - 1) * CONNECTOR_RATIO;
  const matchWidth = Math.min(
    MAX_MATCH_WIDTH,
    Math.max(MIN_MATCH_WIDTH, Math.floor(containerWidth / divisor))
  );
  const connectorWidth = Math.round(matchWidth * CONNECTOR_RATIO);

  return { matchWidth, connectorWidth };
}

export default function useBracketDimensions(containerRef, roundCount) {
  const [dimensions, setDimensions] = useState(() =>
    computeBracketDimensions(0, roundCount)
  );

  useEffect(() => {
    const element = containerRef.current;

    if (!element || !roundCount) {
      return undefined;
    }

    const update = () => {
      setDimensions(computeBracketDimensions(element.clientWidth, roundCount));
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [containerRef, roundCount]);

  return dimensions;
}
