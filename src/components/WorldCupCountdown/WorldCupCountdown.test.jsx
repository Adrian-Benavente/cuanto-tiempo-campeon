import React from "react";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "../../context/LocaleContext";
import WorldCupCountdown from "./WorldCupCountdown";

jest.mock("../../hooks/useLiveNow", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useLiveNow = require("../../hooks/useLiveNow").default;

function renderCountdown(worldCup2026) {
  return render(
    <LocaleProvider>
      <WorldCupCountdown worldCup2026={worldCup2026} />
    </LocaleProvider>
  );
}

describe("WorldCupCountdown", () => {
  it("shows the countdown when days remaining are greater than zero", () => {
    useLiveNow.mockReturnValue(new Date("2026-05-01T12:00:00.000Z"));

    renderCountdown({
      startDate: "2026-06-11T00:00:00.000Z",
      host: ["United States", "Canada", "Mexico"],
    });

    expect(screen.getByText(/41 days until World Cup 2026|Faltan 41 días/)).toBeInTheDocument();
    expect(screen.getByText("United States, Canada, Mexico")).toBeInTheDocument();
  });

  it("hides the countdown at zero days but keeps the host label", () => {
    useLiveNow.mockReturnValue(new Date("2026-06-11T18:00:00.000Z"));

    renderCountdown({
      startDate: "2026-06-11T00:00:00.000Z",
      host: ["United States", "Canada", "Mexico"],
    });

    expect(screen.queryByText(/0 days until World Cup 2026|Faltan 0 días/)).not.toBeInTheDocument();
    expect(screen.getByText("United States, Canada, Mexico")).toBeInTheDocument();
  });

  it("renders nothing at zero days when there is no host", () => {
    useLiveNow.mockReturnValue(new Date("2026-06-11T18:00:00.000Z"));

    const { container } = renderCountdown({
      startDate: "2026-06-11T00:00:00.000Z",
    });

    expect(container).toBeEmptyDOMElement();
  });
});
