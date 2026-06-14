// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

const championsPayload = {
  champions: [
    {
      slug: "argentina",
      displayName: "Argentina",
      countryCode: "AR",
      lastChampionDate: "2022-12-18T18:00:00.000Z",
    },
    {
      slug: "francia",
      displayName: "Francia",
      countryCode: "FR",
      lastChampionDate: "2018-07-15T18:00:00.000Z",
    },
  ],
  source: "fallback",
};

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes("/api/world-champions")) {
      return Promise.resolve({
        ok: true,
        json: async () => championsPayload,
      });
    }

    if (String(url).includes("/api/champion-facts")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          year: 2022,
          host: "Qatar",
          summary: "Argentina ganó la final.",
          trivia: ["Dato de prueba"],
          source: "fallback",
        }),
      });
    }

    if (String(url).includes("/api/champion-aggregates")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          aggregates: [
            { slug: "argentina", displayName: "Argentina", countryCode: "AR", titles: 3 },
            { slug: "brasil", displayName: "Brasil", countryCode: "BR", titles: 5 },
            { slug: "alemania", displayName: "Alemania", countryCode: "DE", titles: 4 },
            { slug: "italia", displayName: "Italia", countryCode: "IT", titles: 4 },
            { slug: "francia", displayName: "Francia", countryCode: "FR", titles: 2 },
            { slug: "uruguay", displayName: "Uruguay", countryCode: "UY", titles: 2 },
            { slug: "inglaterra", displayName: "Inglaterra", countryCode: "GB", titles: 1 },
            { slug: "españa", displayName: "España", countryCode: "ES", titles: 1 },
          ],
          source: "fallback",
        }),
      });
    }

    if (String(url).includes("/api/tournaments-history")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          tournaments: [
            { year: 2022, champion: "Argentina", host: "Qatar" },
            { year: 2018, champion: "Francia", host: "Russia" },
          ],
          source: "fallback",
        }),
      });
    }

    if (String(url).includes("/api/world-cup-2026")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          year: 2026,
          host: "USA/Mexico/Canada",
          startDate: "2026-06-11T16:00:00.000Z",
          source: "fallback",
        }),
      });
    }

    if (String(url).includes("/api/live-matches")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          mode: "idle",
          year: 2026,
          matches: [],
          source: "fallback",
        }),
      });
    }

    if (String(url).includes("/api/world-cup-fixture")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          year: 2026,
          matches: [],
          source: "fallback",
        }),
      });
    }

    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
});
