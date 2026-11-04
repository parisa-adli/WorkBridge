import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Project from "./Project";
import useProject from "../features/project/useProject";
import i18n from "../i18n";

vi.mock("../features/project/useProject");

const project = {
  _id: "p1",
  title: "طراحی سایت",
  translations: { en: { title: "Website design" } },
  proposals: [
    { _id: "pr1", user: { _id: "u1", name: "فریلنسر" }, description: "انجام می دهم", duration: 10, price: 1000, status: 1 },
  ],
};
function renderWith(state: object) {
  vi.mocked(useProject).mockReturnValue({ isLoading: false, project: undefined, ...state } as ReturnType<typeof useProject>);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  render(<Project />, { wrapper });
}

describe("Project", () => {
  it("shows a busy spinner while loading", () => {
    renderWith({ isLoading: true });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows not found when the project is missing", () => {
    renderWith({});
    expect(screen.getByText(i18n.t("common.notFound", { name: i18n.t("project.resource") }))).toBeInTheDocument();
  });

  it("shows an error state when the request fails", () => {
    renderWith({ isError: true });
    expect(screen.getByText(i18n.t("project.loadError"))).toBeInTheDocument();
  });

  it("shows the empty state with no proposals", () => {
    renderWith({ project: { ...project, proposals: [] } });
    expect(screen.getByRole("heading", { name: i18n.t("project.proposalsOf", { title: "طراحی سایت" }) })).toBeInTheDocument();
    expect(screen.getByText(i18n.t("common.notFound", { name: i18n.t("proposal.resource") }))).toBeInTheDocument();
  });

  it("lists the proposals, each with a change-status button", () => {
    renderWith({ project });
    expect(screen.getByRole("cell", { name: "فریلنسر" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: i18n.t("proposal.changeStatus") })).toHaveAttribute("data-slot", "button");
    expect(screen.getByRole("button", { name: i18n.t("common.back") })).toHaveAttribute("data-slot", "button");
  });
});
