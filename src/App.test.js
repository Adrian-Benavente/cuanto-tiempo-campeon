import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the current world champion title", async () => {
  render(<App />);
  expect(
    await screen.findByText(/es el último campeón mundial/i)
  ).toBeInTheDocument();
});

test("renders the ranking section", async () => {
  render(<App />);
  expect(
    await screen.findByText(/resto de campeones mundiales/i)
  ).toBeInTheDocument();
});
