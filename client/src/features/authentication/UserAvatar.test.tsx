import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import UserAvatar from "./UserAvatar";
import initials from "../../utils/initials";
import useUser from "./useUser";

vi.mock("./useUser");
const logout = vi.fn();
vi.mock("./useLogout", () => ({ default: () => ({ isPending: false, logout }) }));

// the tests stub only the fields UserAvatar reads
const mockUser = (user?: object) =>
  vi.mocked(useUser).mockReturnValue({ user } as ReturnType<typeof useUser>);

describe("UserAvatar", () => {
  it("renders nothing when logged out", () => {
    mockUser(undefined);
    const { container } = render(<UserAvatar />, { wrapper: MemoryRouter });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the user's name when logged in", () => {
    mockUser({ name: "پریسا", role: "OWNER" });
    render(<UserAvatar />, { wrapper: MemoryRouter });
    expect(screen.getByText("پریسا")).toBeInTheDocument();
  });

  it("opens a menu with the profile under the role's prefix and logout", () => {
    mockUser({ name: "Test User", role: "FREELANCER" });
    render(<UserAvatar />, { wrapper: MemoryRouter });
    fireEvent.keyDown(screen.getByRole("button", { name: "Test User" }), { key: "Enter" });
    expect(screen.getByRole("menuitem", { name: "پروفایل" })).toHaveAttribute("href", "/freelancer/profile");
    fireEvent.click(screen.getByRole("menuitem", { name: "خروج" }));
    expect(logout).toHaveBeenCalled();
  });

  it("shows the uploaded avatar, or the initials without one", () => {
    // jsdom never loads images; Radix's Avatar shows the <img> only once it has
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(1);
    mockUser({ name: "Test User", role: "OWNER", avatarUrl: null });
    const { container, unmount } = render(<UserAvatar />, { wrapper: MemoryRouter });
    expect(screen.getByText("TU")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    unmount();

    mockUser({ name: "Test User", role: "OWNER", avatarUrl: "http://localhost:5000/uploads/a.png" });
    const { container: withAvatar } = render(<UserAvatar />, { wrapper: MemoryRouter });
    expect(withAvatar.querySelector("img")).toHaveAttribute("src", "http://localhost:5000/uploads/a.png");
    expect(screen.queryByText("TU")).toBeNull();
  });

  it("initials: the first letters of the first two words", () => {
    expect(initials("  پریسا   عدلی  ")).toBe("پع");
    expect(initials("ada")).toBe("A");
    expect(initials()).toBe("");
  });
});
