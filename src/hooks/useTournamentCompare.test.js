import { act, renderHook, waitFor } from "@testing-library/react";
import useTournamentCompare, {
  makeCompareCacheKey,
} from "./useTournamentCompare";

describe("makeCompareCacheKey", () => {
  it("normalizes year order", () => {
    expect(makeCompareCacheKey([2022, 1986])).toBe("1986-2022");
    expect(makeCompareCacheKey([1986, 2022])).toBe("1986-2022");
  });
});

describe("useTournamentCompare", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (String(url).includes("/api/compare?years=1986,2022")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            years: [1986, 2022],
            rows: [
              { year: 1986, champion: "Argentina", totalGoals: 132 },
              { year: 2022, champion: "Argentina", totalGoals: 172 },
            ],
            source: "fallback",
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });
  });

  it("fetches comparison when two years are selected", async () => {
    const { result } = renderHook(() => useTournamentCompare());

    act(() => {
      result.current.toggleYear(1986);
      result.current.toggleYear(2022);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/compare?years=1986,2022");
    expect(result.current.comparison?.rows).toHaveLength(2);
  });

  it("reuses the in-memory cache for the same pair", async () => {
    const { result } = renderHook(() => useTournamentCompare());

    act(() => {
      result.current.toggleYear(1986);
      result.current.toggleYear(2022);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    act(() => {
      result.current.clearSelection();
      result.current.toggleYear(2022);
      result.current.toggleYear(1986);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
