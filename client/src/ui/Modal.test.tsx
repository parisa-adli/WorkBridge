import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import Modal from "./Modal";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>open</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete project">
        <input aria-label="reason" />
        <button>confirm</button>
      </Modal>
    </>
  );
}

function openModal() {
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: "open" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe("Modal", () => {
  it("is a labelled dialog that takes focus when it opens", () => {
    openModal();
    expect(screen.getByRole("dialog", { name: "Delete project" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
  });

  it("traps Tab and Shift+Tab inside the dialog", () => {
    openModal();
    const close = screen.getByRole("button", { name: "بستن" });
    const confirm = screen.getByRole("button", { name: "confirm" });
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
    fireEvent.keyDown(confirm, { key: "Tab" });
    expect(close).toHaveFocus();
  });

  it("closes on Escape and returns focus to its trigger", () => {
    const trigger = openModal();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
