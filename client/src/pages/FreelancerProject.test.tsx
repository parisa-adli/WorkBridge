import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import FreelancerProject from "./FreelancerProject";
import useProject from "../features/project/useProject";
import i18n from "../i18n";

vi.mock("../features/project/useProject");

// the server sends only the freelancer's own proposal
const project = {
  _id: "p1",
  title: "طراحی سایت",
  description: "توضیحات پروژه",
  translations: { en: { title: "Website design", description: "Project description" } },
  status: "CLOSED",
  category: { _id: "c1", title: "وب", englishTitle: "Web" },
  budget: 1000000,
  tags: ["react"],
  proposals: [{ _id: "pr1", status: 2 }],
  deadline: "2030-01-01",
  owner: { _id: "u1", name: "کارفرما" },
  freelancer: null,
};
const mockProject = (proposals: object[] = project.proposals) =>
  vi.mocked(useProject).mockReturnValue({ isLoading: false, project: { ...project, proposals } } as ReturnType<
    typeof useProject
  >);

describe("FreelancerProject", () => {
  it("shows the project and the freelancer's accepted proposal in Persian", () => {
    mockProject();
    render(<FreelancerProject />, { wrapper: MemoryRouter });
    expect(screen.getByRole("heading", { name: "طراحی سایت" })).toBeInTheDocument();
    expect(screen.getByText("وب")).toBeInTheDocument();
    expect(screen.getByText("بسته")).toBeInTheDocument();
    expect(screen.getByText("تایید شده")).toBeInTheDocument();
    // read-only: only the back button
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("shows the English content and a missing proposal in English", async () => {
    await i18n.changeLanguage("en");
    mockProject([]);
    render(<FreelancerProject />, { wrapper: MemoryRouter });
    expect(screen.getByRole("heading", { name: "Website design" })).toBeInTheDocument();
    expect(screen.getByText("Web")).toBeInTheDocument();
    expect(screen.getByText("Not sent yet")).toBeInTheDocument();
  });
});
