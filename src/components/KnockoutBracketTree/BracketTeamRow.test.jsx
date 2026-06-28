import React from "react";
import { render, screen } from "@testing-library/react";
import BracketTeamRow from "./BracketTeamRow";

describe("BracketTeamRow", () => {
  it("shows the display name in the title tooltip", () => {
    render(
      <BracketTeamRow
        team={{
          isTbd: false,
          apiName: "Germany",
          meta: {
            slug: "alemania",
            displayName: "Alemania",
            countryCode: "DE",
          },
          fifaCode: "GER",
        }}
        tbdLabel="Por definir"
      />
    );

    expect(screen.getByTitle("Alemania")).toBeInTheDocument();
    expect(screen.getByText("GER")).toBeInTheDocument();
  });

  it("falls back to the API name when display metadata is missing", () => {
    render(
      <BracketTeamRow
        team={{
          isTbd: false,
          apiName: "Paraguay",
          meta: {
            slug: null,
            displayName: "Paraguay",
            countryCode: null,
          },
          fifaCode: "PAR",
        }}
        tbdLabel="Por definir"
      />
    );

    expect(screen.getByTitle("Paraguay")).toBeInTheDocument();
  });

  it("shows the TBD label in the title tooltip", () => {
    render(
      <BracketTeamRow
        team={{ isTbd: true, apiName: null, meta: null, fifaCode: null }}
        tbdLabel="Por definir"
      />
    );

    expect(screen.getByTitle("Por definir")).toBeInTheDocument();
  });
});
