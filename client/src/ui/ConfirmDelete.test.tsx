import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDelete from "./ConfirmDelete";

function Harness({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <ConfirmDelete
      open={open}
      onOpenChange={setOpen}
      title="حذف پروژه"
      resourceName="پروژه"
      trigger={<button>trash</button>}
      onConfirm={onConfirm}
    />
  );
}

describe("ConfirmDelete", () => {
  it("opens from its trigger as an alert dialog", () => {
    render(<Harness onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "trash" }));
    expect(screen.getByRole("alertdialog", { name: "حذف پروژه" })).toBeInTheDocument();
  });

  it("stays open on confirm until the caller closes it", () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "trash" }));
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(<Harness onConfirm={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "trash" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
