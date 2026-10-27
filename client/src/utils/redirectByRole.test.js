import { describe, expect, it, vi } from "vitest";
import redirectByRole from "./redirectByRole";

describe("redirectByRole", () => {
  it.each([
    ["OWNER", "/owner"],
    ["FREELANCER", "/freelancer"],
    ["ADMIN", "/admin"],
    ["UNKNOWN", "/"],
  ])("sends %s to %s", (role, path) => {
    const navigate = vi.fn();
    redirectByRole(navigate, role);
    expect(navigate).toHaveBeenCalledWith(path);
  });
});
