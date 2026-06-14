import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the current world champion title", async () => {
  render(<App />);
  expect(
    await screen.findByText(/es el último campeón mundial|is the latest world cup winner/i)
  ).toBeInTheDocument();
});

test("renders the ranking section", async () => {
  render(<App />);
  expect(
    await screen.findByText(/resto de campeones mundiales|other world champions/i)
  ).toBeInTheDocument();
});

test("renders country picker", async () => {
  render(<App />);
  expect(await screen.findByText(/mi selección|my team/i)).toBeInTheDocument();
});

test("renders share button", async () => {
  render(<App />);
  expect(
    await screen.findByRole("button", { name: /compartir|share/i })
  ).toBeInTheDocument();
});
