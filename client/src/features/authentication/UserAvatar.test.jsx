import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import UserAvatar from "./UserAvatar";
import useUser from "./useUser";

vi.mock("./useUser");

describe("UserAvatar", () => {
  it("renders nothing when logged out", () => {
    useUser.mockReturnValue({ user: undefined });
    const { container } = render(<UserAvatar />, { wrapper: MemoryRouter });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the user's name when logged in", () => {
    useUser.mockReturnValue({ user: { name: "پریسا", role: "OWNER" } });
    render(<UserAvatar />, { wrapper: MemoryRouter });
    expect(screen.getByText("پریسا")).toBeInTheDocument();
  });
});
