import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthContainer from "./AuthContainer";
import useUser from "./useUser";
import { checkOtp, demoLoginApi, getOtp } from "../../services/authService";
import i18n from "../../i18n";

vi.mock("./useUser");
vi.mock("../../services/authService");
vi.mock("sonner");

const getOtpMock = vi.mocked(getOtp);
const checkOtpMock = vi.mocked(checkOtp);
const demoLoginApiMock = vi.mocked(demoLoginApi);
// the tests stub only the fields each case reads
type OtpResponse = Awaited<ReturnType<typeof getOtp>>;

function Location() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

function renderAuth() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <AuthContainer />
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Radix Tabs switch on mousedown (and keyboard focus), not on click
const openPhoneTab = () => fireEvent.mouseDown(screen.getByRole("tab", { name: "ورود با موبایل" }));

async function sendOtp() {
  openPhoneTab();
  fireEvent.change(screen.getByLabelText("شماره موبایل"), {
    target: { value: "09120000001" },
  });
  fireEvent.click(screen.getByRole("button", { name: "ارسال کد تایید" }));
  await screen.findByText("کد تایید را وارد کنید");
}

describe("AuthContainer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useUser).mockReturnValue({ user: null } as unknown as ReturnType<typeof useUser>);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to the demo tab pre-filled with the owner demo account, also shown as text", () => {
    renderAuth();
    expect(screen.getByRole("tab", { name: "ورود نمایشی" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("کارفرما")).toBeChecked();
    expect(screen.getByLabelText(/ایمیل/)).toHaveValue("owner@workbridge.dev");
    expect(screen.getByLabelText(/رمز عبور/, { selector: "input" })).toHaveValue("Owner@1234");
    expect(screen.getByText("owner@workbridge.dev")).toBeInTheDocument();
    expect(screen.getByText("Owner@1234")).toBeInTheDocument();
  });

  it.each([
    ["فریلنسر", "FREELANCER", "freelancer@workbridge.dev", "Freelancer@1234", "/freelancer"],
  ])("picking %s swaps the credentials and logs in with them", async (label, role, email, password, home) => {
    demoLoginApiMock.mockResolvedValue({
      message: "welcome",
      code: "LOGGED_IN",
      user: { role } as Awaited<ReturnType<typeof demoLoginApi>>["user"],
    });
    renderAuth();
    fireEvent.click(screen.getByLabelText(label));
    expect(screen.getByLabelText(/ایمیل/)).toHaveValue(email);
    expect(screen.getByLabelText(/رمز عبور/, { selector: "input" })).toHaveValue(password);
    expect(screen.getByText(email)).toBeInTheDocument();
    expect(screen.getByText(password)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ورود" }));
    await waitFor(() => expect(demoLoginApiMock.mock.calls[0][0]).toEqual({ email, password }));
    // the mutation resolves before the redirect renders, so wait for both under load
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(home));
    expect(toast.success).toHaveBeenCalledWith("welcome");
  });

  it("switches tabs with the arrow keys", async () => {
    renderAuth();
    const demoTab = screen.getByRole("tab", { name: "ورود نمایشی" });
    act(() => demoTab.focus());
    fireEvent.keyDown(demoTab, { key: "ArrowRight" });
    // Radix moves focus in a timeout
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "ورود با موبایل" })).toHaveAttribute("aria-selected", "true")
    );
    expect(screen.getByLabelText("شماره موبایل")).toBeInTheDocument();
  });

  it("shows the returned code in the send-OTP toast", async () => {
    getOtpMock.mockResolvedValue({ message: "sent", code: "OTP_SENT", otp: 123456 });
    renderAuth();
    await sendOtp();
    expect(toast.success).toHaveBeenCalledWith("sent - کد تایید: 123456");
  });

  it("shows only the message when no code is returned", async () => {
    getOtpMock.mockResolvedValue({ message: "sent", code: "OTP_SENT" });
    renderAuth();
    await sendOtp();
    expect(toast.success).toHaveBeenCalledWith("sent");
  });

  it("resends the code to the entered phone number", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getOtpMock.mockResolvedValue({ message: "sent", code: "OTP_SENT" });
    renderAuth();
    await sendOtp();
    // the resend button appears once the 90-second timer has run out
    for (let i = 0; i < 90; i++) act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button", { name: "ارسال مجدد کد تایید" }));
    await waitFor(() =>
      expect(getOtpMock.mock.calls[1][0]).toEqual({ phoneNumber: "09120000001" })
    );
  });

  it("shows the phone error and sends nothing for a malformed number", async () => {
    renderAuth();
    openPhoneTab();
    fireEvent.change(screen.getByLabelText("شماره موبایل"), { target: { value: "0912" } });
    fireEvent.click(screen.getByRole("button", { name: "ارسال کد تایید" }));
    expect(await screen.findByText("شماره موبایل وارد شده صحیح نمیباشد")).toBeInTheDocument();
    expect(getOtp).not.toHaveBeenCalled();
  });

  it("shows the code error and sends nothing for an incomplete code", async () => {
    getOtpMock.mockResolvedValue({ message: "sent" } as OtpResponse);
    renderAuth();
    await sendOtp();
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));
    expect(await screen.findByText("کد ارسال شده صحیح نمیباشد")).toBeInTheDocument();
    expect(checkOtp).not.toHaveBeenCalled();
  });

  it("shows the rate-limit message from check-otp", async () => {
    getOtpMock.mockResolvedValue({ message: "sent" } as OtpResponse);
    checkOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { statusCode: 429, code: "RATE_LIMITED", message: "too many requests" },
      },
    });
    renderAuth();
    await sendOtp();
    // the form now checks the code length before calling the server
    fireEvent.change(screen.getByLabelText("کد تایید را وارد کنید"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));
    await waitFor(() =>
      expect(checkOtpMock.mock.calls[0][0]).toEqual({ phoneNumber: "09120000001", otp: "123456" })
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("too many requests")
    );
  });

  it("reads in English after a language switch", async () => {
    await i18n.changeLanguage("en");
    renderAuth();
    expect(screen.getByRole("tab", { name: "Demo login" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Freelancer")).toBeInTheDocument();
    expect(screen.queryByLabelText("Admin")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });
});
