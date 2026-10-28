import { describe, expect, it } from "vitest";
import toLocalDateShort from "./toLocalDateShort";

describe("toLocalDateShort", () => {
  it("formats a date in the Persian calendar", () => {
    expect(toLocalDateShort("2024-03-20T12:00:00Z")).toBe(
      new Date("2024-03-20T12:00:00Z").toLocaleDateString("fa-IR")
    );
  });

  it("shows a dash instead of Invalid Date for a missing or bad date", () => {
    expect(toLocalDateShort(undefined)).toBe("-");
    expect(toLocalDateShort(null)).toBe("-");
    expect(toLocalDateShort("not a date")).toBe("-");
  });
});
