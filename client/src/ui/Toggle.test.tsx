import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Toggle from "./Toggle";

describe("Toggle", () => {
  it("is a switch labelled by its label that reports the new state", () => {
    const onChange = vi.fn();
    render(<Toggle label="Open" enabled={false} onChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Open" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
