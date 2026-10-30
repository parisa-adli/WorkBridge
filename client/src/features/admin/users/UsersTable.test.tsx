import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import UsersTable from "./UsersTable";
import useUsers from "../useUsers";
import i18n from "../../../i18n";

vi.mock("../useUsers");

const base = { users: [] as unknown[], total: 0, page: 1, limit: 10, isLoading: false, isError: false };
function renderWith(state: Partial<typeof base>) {
  vi.mocked(useUsers).mockReturnValue({ ...base, ...state } as unknown as ReturnType<typeof useUsers>);
  render(
    <MemoryRouter>
      <UsersTable />
    </MemoryRouter>
  );
}

describe("UsersTable", () => {
  it("shows a busy skeleton while loading", () => {
    renderWith({ isLoading: true });
    expect(screen.getByRole("status", { name: i18n.t("common.loading") })).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an error state when the request fails", () => {
    renderWith({ isError: true });
    expect(screen.getByText(i18n.t("common.loadError"))).toBeInTheDocument();
  });

  it("shows the empty state with no users", () => {
    renderWith({});
    expect(screen.getByText(i18n.t("common.notFound", { name: i18n.t("user.resource") }))).toBeInTheDocument();
  });

  it("shows the users in a table", () => {
    const user = { _id: "u1", name: "سارا", phoneNumber: "09120000000", email: "s@x.com", role: "OWNER", status: 2 };
    renderWith({ users: [user], total: 1 });
    expect(screen.getByRole("link", { name: "سارا" })).toHaveAttribute("href", "/admin/users/u1");
  });
});
