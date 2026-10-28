import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import AdminUserProfile from "./AdminUserProfile";
import useUserProfile from "../features/admin/users/useUserProfile";
import { changeUserStatusApi } from "../services/authService";
import i18n from "../i18n";

vi.mock("../features/admin/users/useUserProfile");
vi.mock("../services/authService");

const project = (title: string, en: string) => ({
  _id: title,
  title,
  translations: { en: { title: en } },
  status: "OPEN",
});
vi.mocked(useUserProfile).mockReturnValue({
  isLoading: false,
  profile: {
    user: {
      _id: "u1",
      name: "کاربر",
      translations: { en: { name: "Member" } },
      phoneNumber: "09120000032",
      email: "m@x.com",
      biography: null,
      avatarUrl: null,
      status: 1,
      role: "FREELANCER",
    },
    createdProjects: [],
    completedProjects: [project("فروشگاه", "Shop")],
    proposals: [{ _id: "pr1", price: 1000, status: 2, project: project("سایت", "Website") }],
  },
} as unknown as ReturnType<typeof useUserProfile>);

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("AdminUserProfile", () => {
  it("shows the user, their projects and proposals in Persian", () => {
    render(<AdminUserProfile />, { wrapper });
    expect(screen.getByRole("heading", { name: "کاربر" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "فروشگاه" })).toHaveAttribute("href", "/admin/projects/فروشگاه");
    expect(screen.getByRole("link", { name: "سایت" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("1");
  });

  it("changes the status in place and refreshes the user and the users list", async () => {
    vi.mocked(changeUserStatusApi).mockResolvedValue({ message: "ok", code: "USER_ACCEPTED" });
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUserProfile />
        </MemoryRouter>
      </QueryClientProvider>
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin-user"] }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(changeUserStatusApi).toHaveBeenCalledWith({ userId: "u1", data: { status: 2 } }, expect.anything());
  });

  it("shows the English content in English", async () => {
    await i18n.changeLanguage("en");
    render(<AdminUserProfile />, { wrapper });
    expect(screen.getByRole("heading", { name: "Member" })).toBeInTheDocument();
    expect(screen.getByText("Completed projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Website" })).toBeInTheDocument();
    expect(screen.getByText("Freelancer")).toBeInTheDocument();
  });
});
