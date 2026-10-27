import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthContainer from "./AuthContainer";
import useUser from "./useUser";
import { checkOtp, getOtp } from "../../services/authService";

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

  it("shows the returned code in the send-OTP toast", async () => {
    getOtp.mockResolvedValue({ message: "sent", code: "OTP_SENT", otp: 123456 });
    renderAuth();
    await sendOtp();
    expect(toast.success).toHaveBeenCalledWith("sent - کد تایید: 123456");
  });

  it("shows only the message when no code is returned", async () => {
    getOtp.mockResolvedValue({ message: "sent", code: "OTP_SENT" });
    renderAuth();
    await sendOtp();
    expect(toast.success).toHaveBeenCalledWith("sent");
  });

  it("shows the phone error and sends nothing for a malformed number", async () => {
    renderAuth();
    fireEvent.change(screen.getByLabelText("شماره موبایل"), { target: { value: "0912" } });
    fireEvent.click(screen.getByRole("button", { name: "ارسال کد تایید" }));
    expect(await screen.findByText("شماره موبایل وارد شده صحیح نمیباشد")).toBeInTheDocument();
    expect(getOtp).not.toHaveBeenCalled();
  });

  it("shows the code error and sends nothing for an incomplete code", async () => {
    getOtp.mockResolvedValue({ message: "sent" });
    renderAuth();
    await sendOtp();
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));
    expect(await screen.findByText("کد ارسال شده صحیح نمیباشد")).toBeInTheDocument();
    expect(checkOtp).not.toHaveBeenCalled();
  });

  it("shows the rate-limit message from check-otp", async () => {
    getOtp.mockResolvedValue({ message: "sent" });
    checkOtp.mockRejectedValue({
      response: {
        status: 429,
        data: { statusCode: 429, code: "RATE_LIMITED", message: "too many requests" },
      },
    });
    renderAuth();
    await sendOtp();
    // the form now checks the code length before calling the server
    fireEvent.paste(screen.getByLabelText("Please enter OTP character 1"), {
      clipboardData: { getData: () => "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));
    await waitFor(() =>
      expect(checkOtp.mock.calls[0][0]).toEqual({ phoneNumber: "09120000001", otp: "123456" })
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("too many requests")
    );
  });
});
