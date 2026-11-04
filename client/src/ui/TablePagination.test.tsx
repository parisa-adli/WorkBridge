import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TablePagination from "./TablePagination";

function Search() {
  return <output>{useLocation().search}</output>;
}

function renderAt(url: string, page: number, total: number) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <TablePagination page={page} total={total} limit={10} />
      <Search />
    </MemoryRouter>
  );
}

describe("TablePagination", () => {
  it("hides on a single page", () => {
    renderAt("/list", 1, 10);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("writes the page to the URL and keeps the filters", () => {
    renderAt("/list?status=OPEN", 1, 25);
    fireEvent.click(screen.getByRole("button", { name: "۳" }));
    expect(screen.getByRole("status")).toHaveTextContent("?status=OPEN&page=3");
  });

  it("stays visible past the last page", () => {
    renderAt("/list?page=2", 2, 10);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
