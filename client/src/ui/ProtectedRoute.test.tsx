import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import useUser from "../features/authentication/useUser";

vi.mock("../features/authentication/useUser");
vi.mock("react-hot-toast");

// user is a stub: only role and status
function renderAt(pathname: string, user?: object) {
  vi.mocked(useUser).mockReturnValue({ isLoading: false, user } as ReturnType<typeof useUser>);
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <p>owner page</p>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<p>auth page</p>} />
        <Route path="/not-access" element={<p>not access page</p>} />
        <Route path="/" element={<p>home page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => vi.resetAllMocks());

  it("renders the page for a verified user with the right role", () => {
    renderAt("/owner", { role: "OWNER", status: 2 });
    expect(screen.getByText("owner page")).toBeInTheDocument();
  });

  it("sends a logged-out visitor to /auth without a toast", async () => {
    renderAt("/owner", undefined);
    expect(await screen.findByText("auth page")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("sends an unverified user home with a toast", async () => {
    renderAt("/owner", { role: "OWNER", status: 1 });
    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("sends a verified user with another role to /not-access", async () => {
    renderAt("/owner", { role: "FREELANCER", status: 2 });
    expect(await screen.findByText("not access page")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
