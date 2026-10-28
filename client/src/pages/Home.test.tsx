import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Home from "./Home";
import usePublicStats from "../hooks/usePublicStats";
import i18n from "../i18n";

vi.mock("../hooks/usePublicStats");
vi.mock("../ui/MainHeader", () => ({ default: () => null }));

const stats = {
  freelancers: 12,
  owners: 7,
  openProjects: 31,
  categories: [{ _id: "c1", title: "برنامه نویسی", englishTitle: "development", projects: 5 }],
};
const mockStats = (isLoading = false) =>
  vi.mocked(usePublicStats).mockReturnValue({ isLoading, stats: isLoading ? undefined : stats });

describe("Home", () => {
  it("shows the server's numbers and categories in Persian", () => {
    mockStats();
    render(<Home />, { wrapper: MemoryRouter });
    expect(screen.getByText("۱۲")).toBeInTheDocument();
    expect(screen.getByText("۷")).toBeInTheDocument();
    expect(screen.getByText("۳۱")).toBeInTheDocument();
    expect(screen.getByText("پروژه های باز")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /برنامه نویسی\s*۵ پروژه/ })).toHaveAttribute("href", "/auth");
    // no hardcoded numbers left
    expect(screen.queryByText("۷۴۲۳")).not.toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    mockStats(true);
    const { container } = render(<Home />, { wrapper: MemoryRouter });
    expect(container.querySelectorAll("[aria-busy=true]")).toHaveLength(2);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4 + 3);
    expect(screen.queryByText("۱۲")).not.toBeInTheDocument();
  });

  it("shows the numbers and the English category title in English, and every link goes somewhere", async () => {
    await i18n.changeLanguage("en");
    mockStats();
    render(<Home />, { wrapper: MemoryRouter });
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Clients", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /development\s*5 projects/ })).toBeInTheDocument();
    for (const link of screen.getAllByRole("link")) expect(link).toHaveAttribute("href");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
