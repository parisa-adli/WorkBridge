import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "./LanguageContext";
import LanguageToggle from "../ui/LanguageToggle";
import i18n from "../i18n";

const renderToggle = () =>
  render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );

describe("LanguageProvider", () => {
  it("defaults to Persian rtl with no saved choice", () => {
    renderToggle();
    expect(document.documentElement).toHaveAttribute("lang", "fa");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });

  it("switches to English ltr and saves the choice", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "EN تغییر زبان" }));
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
    expect(i18n.language).toBe("en");
    expect(localStorage.getItem("language")).toBe('"en"');
  });

  it("restores a saved choice and treats junk as Persian", () => {
    localStorage.setItem("language", '"en"');
    const { unmount } = renderToggle();
    expect(screen.getByRole("button", { name: "فا Switch language" })).toBeInTheDocument();
    unmount();

    localStorage.setItem("language", '"xx"');
    renderToggle();
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });
});
