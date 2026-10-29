import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusBadge from "./StatusBadge";
import { PROJECT_STATUS_BADGES } from "../constants";
import i18n from "../i18n";

describe("StatusBadge", () => {
  it("shows the status label and style", () => {
    render(<StatusBadge status={0} />);
    expect(screen.getByText("رد شده")).toHaveAttribute("data-variant", "destructive");
  });

  it("uses the given badge set", () => {
    render(<StatusBadge status="OPEN" badges={PROJECT_STATUS_BADGES} />);
    expect(screen.getByText("باز")).toHaveAttribute("data-variant", "default");
  });

  it("falls back for unknown values", () => {
    render(<StatusBadge status={7} />);
    expect(screen.getByText("نامشخص")).toBeInTheDocument();
  });

  it("reads the label in the active language", async () => {
    await i18n.changeLanguage("en");
    render(<StatusBadge status={1} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
