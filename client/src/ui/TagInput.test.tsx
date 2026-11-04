import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TagInput from "./TagInput";

describe("TagInput", () => {
  it("adds a trimmed tag on Enter, skips duplicates and removes the last one on Backspace", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagInput label="تگ" value={["React"]} onChange={onChange} />);
    const input = screen.getByLabelText("تگ");

    fireEvent.change(input, { target: { value: " Node " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["React", "Node"]);
    expect(input).toHaveValue("");

    onChange.mockClear();
    fireEvent.change(input, { target: { value: "React" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();

    rerender(<TagInput label="تگ" value={["React", "Node"]} onChange={onChange} />);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith(["React"]);
  });

  it("removes a tag with its button", () => {
    const onChange = vi.fn();
    render(<TagInput label="تگ" value={["React", "Node"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "حذف React" }));
    expect(onChange).toHaveBeenCalledWith(["Node"]);
  });
});
