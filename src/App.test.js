import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the current world champion title", () => {
  render(<App />);
  expect(screen.getByText(/es el último campeón mundial/i)).toBeInTheDocument();
});
