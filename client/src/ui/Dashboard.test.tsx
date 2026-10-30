import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Layers, User } from "lucide-react";
import Dashboard from "./Dashboard";

describe("Dashboard", () => {
  it("shows each stat as a card with its value in Persian digits", () => {
    render(
      <Dashboard
        isLoading={false}
        stats={[
          { title: "کاربران", value: 12, icon: User },
          { title: "کیف پول", value: "1,500", icon: Layers },
        ]}
      />
    );
    expect(screen.getByRole("heading", { name: "آمار کلی" })).toBeInTheDocument();
    expect(screen.getByText("کاربران").closest("[data-slot=card]")).toHaveTextContent("۱۲");
    expect(screen.getByText("کیف پول").closest("[data-slot=card]")).toHaveTextContent("۱,۵۰۰");
  });

  it("shows a spinner and no stats while loading", () => {
    render(<Dashboard isLoading stats={[{ title: "کاربران", value: 0, icon: User }]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("کاربران")).not.toBeInTheDocument();
  });
});
