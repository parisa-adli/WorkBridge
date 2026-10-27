import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useAuthorize from "./useAuthorize";
import useUser from "./useUser";

vi.mock("./useUser");

function authorizeAt(pathname, user) {
  useUser.mockReturnValue({ isLoading: false, user });
  const wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
  );
  return renderHook(() => useAuthorize(), { wrapper }).result.current;
}

describe("useAuthorize", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    ["/owner/projects", "OWNER"],
    ["/freelancer/proposals", "FREELANCER"],
    ["/admin/users", "ADMIN"],
  ])("authorizes %s for a verified %s", (pathname, role) => {
    const result = authorizeAt(pathname, { role, status: 2 });
    expect(result).toMatchObject({
      isAuthenticated: true,
      isAuthorized: true,
      isVerified: true,
    });
  });

  it.each([
    ["/owner", "FREELANCER"],
    ["/freelancer", "ADMIN"],
    ["/admin", "OWNER"],
  ])("does not authorize %s for a %s", (pathname, role) => {
    expect(authorizeAt(pathname, { role, status: 2 }).isAuthorized).toBe(false);
  });

  it("reads the role from the first URL segment only", () => {
    expect(
      authorizeAt("/freelancer/owner", { role: "OWNER", status: 2 }).isAuthorized
    ).toBe(false);
    expect(
      authorizeAt("/projects/owner", { role: "OWNER", status: 2 }).isAuthorized
    ).toBe(false);
  });

  it.each([0, 1, "1"])("is not verified when status is %s", (status) => {
    const result = authorizeAt("/owner", { role: "OWNER", status });
    expect(result.isVerified).toBe(false);
    expect(result.isAuthorized).toBe(true);
  });

  it("treats a string status of '2' as verified", () => {
    expect(authorizeAt("/owner", { role: "OWNER", status: "2" }).isVerified).toBe(
      true
    );
  });

  it("is neither authenticated nor authorized without a user", () => {
    expect(authorizeAt("/owner", undefined)).toMatchObject({
      isAuthenticated: false,
      isAuthorized: false,
      isVerified: false,
    });
  });
});
