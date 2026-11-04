import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../context/LanguageContext";
import DatePickerField from "./DatePickerField";

describe("DatePickerField", () => {
  it("shows and picks Jalali days in Persian, and hands back the Gregorian date", () => {
    const setDate = vi.fn();
    render(
      <LanguageProvider>
        <DatePickerField label="ددلاین" date={new Date(2030, 0, 1)} setDate={setDate} />
      </LanguageProvider>
    );
    const trigger = screen.getByRole("button", { name: "ددلاین" });
    expect(trigger).toHaveTextContent("۱۴۰۸/۱۰/۱۲"); // 2030-01-01

    fireEvent.click(trigger);
    expect(screen.getByRole("grid", { name: "دی ۱۴۰۸" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: / ۱۳-ام دی ۱۴۰۸/ }));
    expect(setDate.mock.calls[0][0].toDateString()).toBe(new Date(2030, 0, 2).toDateString());
  });
});
