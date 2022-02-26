import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../App";

test("renders input", () => {
  render(<App />);
  const inputElement = screen.getByText(/input your (.*) name/i);
  expect(inputElement).toBeInTheDocument();
});
