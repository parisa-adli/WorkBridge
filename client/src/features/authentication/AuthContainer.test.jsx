import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthContainer from "./AuthContainer";
import useUser from "./useUser";
import { checkOtp, getOtp, loginApi } from "../../services/authService";

vi.mock("./useUser");
vi.mock("../../services/authService");
vi.mock("react-hot-toast");

function renderAuth() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <AuthContainer />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function sendOtp() {
  fireEvent.click(screen.getByRole("tab", { name: "ورود با موبایل" }));
  fireEvent.change(screen.getByLabelText("شماره موبایل"), {
    target: { value: "09120000001" },
  });
  fireEvent.click(screen.getByRole("button", { name: "ارسال کد تایید" }));
  await screen.findByText("کد تایید را وارد کنید");
}

describe("AuthContainer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useUser.mockReturnValue({ user: null });
  });

  it("defaults to the email tab pre-filled with the owner demo account", () => {
    renderAuth();
    expect(screen.getByRole("tab", { name: "ورود با ایمیل" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("کارفرما")).toBeChecked();
    expect(screen.getByLabelText(/ایمیل/)).toHaveValue("owner@workbridge.dev");
    expect(screen.getByLabelText(/رمز عبور/)).toHaveValue("Owner@1234");
  });

  it("switches to the freelancer demo account and logs in with it", async () => {
    loginApi.mockResolvedValue({ message: "welcome", user: { role: "FREELANCER" } });
    renderAuth();
    fireEvent.click(screen.getByLabelText("فریلنسر"));
    expect(screen.getByLabelText(/ایمیل/)).toHaveValue("freelancer@workbridge.dev");
    fireEvent.click(screen.getByRole("button", { name: "ورود" }));
    await waitFor(() =>
      expect(loginApi).toHaveBeenCalledWith({
        email: "freelancer@workbridge.dev",
        password: "Freelancer@1234",
      })
    );
    expect(toast.success).toHaveBeenCalledWith("welcome");
  });

  it("shows the returned code in the send-OTP toast", async () => {
    getOtp.mockResolvedValue({ message: "sent", code: 123456 });
    renderAuth();
    await sendOtp();
    expect(toast.success).toHaveBeenCalledWith("sent - کد تایید: 123456");
  });

  it("shows only the message when no code is returned", async () => {
    getOtp.mockResolvedValue({ message: "sent" });
    renderAuth();
    await sendOtp();
    expect(toast.success).toHaveBeenCalledWith("sent");
  });

  it("shows the rate-limit message from check-otp", async () => {
    getOtp.mockResolvedValue({ message: "sent" });
    checkOtp.mockRejectedValue({
      response: { status: 429, data: { message: "too many requests" } },
    });
    renderAuth();
    await sendOtp();
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("too many requests")
    );
  });
});
