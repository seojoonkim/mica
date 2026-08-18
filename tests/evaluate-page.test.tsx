import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EvaluatePage from "@/app/[lang]/evaluate/page";

describe("evaluate planner route", () => {
  it("renders truthful accessible planner controls", async () => {
    render(await EvaluatePage({ params: Promise.resolve({ lang: "en" }) }));
    expect(screen.getByRole("heading", { name: /evaluation scope planner/i })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByText(/scope preview/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/no runs execute/i).length).toBeGreaterThan(0);
  });

  it("fails closed when a custom selection is emptied", async () => {
    render(await EvaluatePage({ params: Promise.resolve({ lang: "en" }) }));
    fireEvent.click(screen.getByRole("radio", { name: "Custom matrix" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "South Korea" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Reschedule a three-party meeting across two timezones" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/zero cells/i);
    expect(screen.getByText("Planned cells").nextElementSibling).toHaveTextContent("0");
  });
});
