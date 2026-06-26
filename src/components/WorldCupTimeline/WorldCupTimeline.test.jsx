import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import WorldCupTimeline from "./WorldCupTimeline";
import { LocaleProvider } from "../../context/LocaleContext";

const tournaments = [
  { year: 1986, champion: "Argentina", upcoming: false },
  { year: 2022, champion: "Argentina", upcoming: false },
];

function renderTimeline() {
  return render(
    <LocaleProvider>
      <WorldCupTimeline tournaments={tournaments} />
    </LocaleProvider>
  );
}

describe("WorldCupTimeline", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (String(url).includes("/api/compare?years=1986,2022")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            years: [1986, 2022],
            rows: [
              {
                year: 1986,
                champion: "Argentina",
                runnerUp: "Alemania",
                totalGoals: 132,
              },
              {
                year: 2022,
                champion: "Argentina",
                runnerUp: "Francia",
                totalGoals: 172,
              },
            ],
            source: "fallback",
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });
  });

  it("loads comparison after selecting two tournaments", async () => {
    renderTimeline();

    fireEvent.click(screen.getByRole("button", { name: /1986/i }));
    fireEvent.click(screen.getByRole("button", { name: /2022/i }));

    await waitFor(() => {
      expect(screen.getByText(/comparación|comparison/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText("Argentina").length).toBeGreaterThanOrEqual(2);
    expect(global.fetch).toHaveBeenCalledWith("/api/compare?years=1986,2022");
  });

  it("clears the comparison panel", async () => {
    renderTimeline();

    fireEvent.click(screen.getByRole("button", { name: /1986/i }));
    fireEvent.click(screen.getByRole("button", { name: /2022/i }));

    await waitFor(() => {
      expect(screen.getByText(/comparación|comparison/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /limpiar|clear/i }));

    expect(screen.queryByText(/comparación|comparison/i)).not.toBeInTheDocument();
  });
});
