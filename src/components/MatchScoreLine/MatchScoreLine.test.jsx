import React from "react";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "../../context/LocaleContext";
import MatchScoreLine from "./MatchScoreLine";

function renderScoreLine(props) {
  return render(
    <LocaleProvider>
      <MatchScoreLine {...props} />
    </LocaleProvider>
  );
}

describe("MatchScoreLine", () => {
  it("renders a regular score without parentheses", () => {
    renderScoreLine({ homeScore: 2, awayScore: 1 });

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("(3)")).not.toBeInTheDocument();
  });

  it("renders regulation score with penalties in parentheses", () => {
    renderScoreLine({
      homeScore: 1,
      awayScore: 1,
      homePenalties: 3,
      awayPenalties: 4,
    });

    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(4)")).toBeInTheDocument();
    expect(
      screen.getByLabelText("1 to 1, 3–4 on penalties")
    ).toBeInTheDocument();
  });
});
