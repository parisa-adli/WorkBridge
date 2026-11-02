import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import CategoriesTable from "./CategoriesTable";
import useCategories from "../../../hooks/useCategories";
import { removeCategoryApi } from "../../../services/categoryService";
import i18n from "../../../i18n";

vi.mock("../../../hooks/useCategories");
vi.mock("../../../services/categoryService");

const category = { description: "category", type: "project", createdAt: "", updatedAt: "" };
const rawCategories = [
  { ...category, _id: "c1", title: "وب", englishTitle: "Web" },
  { ...category, _id: "c2", title: "فرانت", englishTitle: "Frontend" },
];

describe("CategoriesTable", () => {
  it("shows an error state when the request fails", () => {
    vi.mocked(useCategories).mockReturnValue({ isLoading: false, isError: true, rawCategories: [] } as unknown as ReturnType<
      typeof useCategories
    >);
    render(<CategoriesTable />);
    expect(screen.getByText(i18n.t("common.loadError"))).toBeInTheDocument();
  });

  it("lists categories, deletes one and refetches the list", async () => {
    vi.mocked(useCategories).mockReturnValue({ isLoading: false, rawCategories } as unknown as ReturnType<
      typeof useCategories
    >);
    vi.mocked(removeCategoryApi).mockResolvedValue({ message: "ok", code: "CATEGORY_DELETED" });
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesTable />
      </QueryClientProvider>
    );

    expect(screen.getByText("وب")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: i18n.t("category.delete", { title: "وب" }) }));
    fireEvent.click(screen.getByRole("button", { name: i18n.t("common.confirm") }));

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["categories"] }));
    expect(removeCategoryApi).toHaveBeenCalledWith("c1", expect.anything());
  });
});
