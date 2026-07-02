import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "../../context/LocaleContext";
import MatchDetailModal from "./MatchDetailModal";

const SAMPLE_MATCH = {
  id: "2026-081",
  homeTeam: "USA",
  awayTeam: "Bosnia and Herzegovina",
  homeScore: 2,
  awayScore: 0,
  status: "finished",
  stage: "r32",
  date: "2026-07-02",
  kickoffUtc: "2026-07-02T00:00:00.000Z",
  stadium: "Levi's Stadium",
  city: "Santa Clara",
  attendance: 68827,
  goals: [
    { minute: 45, team: "home", scorer: "Balogun", type: "normal" },
    { minute: 82, team: "home", scorer: "Tillman", type: "normal" },
  ],
  statistics: {
    home: { possessionPct: 56, shotsTotal: 11 },
    away: { possessionPct: 44, shotsTotal: 2 },
  },
};

function renderModal(match = SAMPLE_MATCH, onClose = jest.fn()) {
  return render(
    <LocaleProvider>
      <MatchDetailModal match={match} onClose={onClose} />
    </LocaleProvider>
  );
}

describe("MatchDetailModal", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = jest.fn(function showModal() {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn(function close() {
      this.open = false;
    });
  });

  it("renders match score, goals and stats when open", () => {
    renderModal();

    expect(screen.getByText("Match details")).toBeInTheDocument();
    expect(screen.getByText("Estados Unidos")).toBeInTheDocument();
    expect(screen.getByText("Bosnia y Herzegovina")).toBeInTheDocument();
    expect(screen.getByText("Balogun")).toBeInTheDocument();
    expect(screen.getByText("Statistics")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = jest.fn();
    renderModal(SAMPLE_MATCH, onClose);

    await userEvent.click(screen.getByLabelText("Close"));

    expect(onClose).toHaveBeenCalled();
  });
});
