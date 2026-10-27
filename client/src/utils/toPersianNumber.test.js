import { describe, expect, it } from "vitest";
import { toPersianNumbers, toPersianNumbersWithComma } from "./toPersianNumber";
import toLocalDateShort from "./toLocalDateShort";

describe("toPersianNumbers", () => {
  it("maps every Latin digit to its Persian digit", () => {
    expect(toPersianNumbers("0123456789")).toBe("۰۱۲۳۴۵۶۷۸۹");
  });

  it("accepts numbers and leaves non-digits alone", () => {
    expect(toPersianNumbers(1500)).toBe("۱۵۰۰");
    expect(toPersianNumbers("12:30")).toBe("۱۲:۳۰");
  });
});

describe("toPersianNumbersWithComma", () => {
  it("adds a comma every three digits, then converts to Persian digits", () => {
    expect(toPersianNumbersWithComma(1234567)).toBe("۱,۲۳۴,۵۶۷");
    expect(toPersianNumbersWithComma(100)).toBe("۱۰۰");
    expect(toPersianNumbersWithComma(1000)).toBe("۱,۰۰۰");
  });
});

describe("toLocalDateShort", () => {
  it("formats as a fa-IR (Jalali) date with Persian digits", () => {
    // Noon UTC keeps the calendar day stable in any test-machine timezone.
    expect(toLocalDateShort("2024-03-20T12:00:00Z")).toBe("۱۴۰۳/۱/۱");
    expect(toLocalDateShort("2024-12-25T12:00:00Z")).toBe("۱۴۰۳/۱۰/۵");
  });
});

it("CI red check: deliberately failing (throwaway branch)", () => {
  expect(1).toBe(2);
});
