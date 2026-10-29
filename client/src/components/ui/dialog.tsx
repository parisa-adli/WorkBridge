import type { ComponentProps } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogTitle = DialogPrimitive.Title;
const DialogClose = DialogPrimitive.Close;

// The content sits inside the overlay (Radix's scrollable-overlay pattern), so the overlay centers it.
function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-backdrop", className)}
      {...props}
    />
  );
}

function DialogContent({ className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn("rounded-lg border border-border bg-surface text-text shadow-xl", className)}
      {...props}
    />
  );
}

export { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose };
