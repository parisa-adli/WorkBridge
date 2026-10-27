import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusBadge from "./StatusBadge";
import { PROJECT_STATUS_BADGES } from "../constants";

describe("StatusBadge", () => {
  it("shows the status label and style", () => {
    render(<StatusBadge status={0} />);
    expect(screen.getByText("رد شده")).toHaveClass("badge", "badge--danger");
  });

  it("uses the given badge set", () => {
    render(<StatusBadge status="OPEN" badges={PROJECT_STATUS_BADGES} />);
    expect(screen.getByText("باز")).toHaveClass("badge--success");
  });

  it("falls back for unknown values", () => {
    render(<StatusBadge status={7} />);
    expect(screen.getByText("نامشخص")).toBeInTheDocument();
  });
});
