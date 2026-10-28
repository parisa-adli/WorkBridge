import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Pagination from "./Pagination";

function renderAt(page: number, totalPages: number) {
  const onPageChange = vi.fn();
  render(<Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />);
  return onPageChange;
}

// Page buttons are named by their number ("2", "۲" in fa) inside the pagination nav.
const pageLabels = () =>
  screen.getAllByRole("listitem").map((li) => li.textContent);

describe("Pagination", () => {
  it("marks the current page", () => {
    renderAt(2, 3);
    expect(screen.getByRole("button", { current: "page" })).toHaveTextContent("۲");
  });

  it("moves to the clicked, previous and next page", () => {
    const onPageChange = renderAt(2, 3);
    fireEvent.click(screen.getByRole("button", { name: "۳" }));
    fireEvent.click(screen.getByRole("button", { name: "صفحه قبل" }));
    fireEvent.click(screen.getByRole("button", { name: "صفحه بعد" }));
    expect(onPageChange.mock.calls).toEqual([[3], [1], [3]]);
  });

  it("lists every page when there are up to seven", () => {
    renderAt(1, 7);
    expect(pageLabels()).toEqual(["", "۱", "۲", "۳", "۴", "۵", "۶", "۷", ""]);
  });

  it("collapses long ranges around the current page", () => {
    renderAt(5, 10);
    expect(pageLabels()).toEqual(["", "۱", "…", "۴", "۵", "۶", "…", "۱۰", ""]);
  });

  it("keeps the first pages together at the start of a long range", () => {
    renderAt(2, 10);
    expect(pageLabels()).toEqual(["", "۱", "۲", "۳", "…", "۱۰", ""]);
  });

  it("disables previous on the first page and next on the last", () => {
    renderAt(1, 1);
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "صفحه بعد" })).toBeDisabled();
  });
});
