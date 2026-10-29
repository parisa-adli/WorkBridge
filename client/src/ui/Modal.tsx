import { useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineX } from "react-icons/hi";
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

// Radix Dialog traps focus and closes on Escape and outside press.
function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useTranslation();
  // Radix returns focus only to a <Dialog.Trigger>; our callers open it from their own buttons.
  const trigger = useRef<HTMLElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPortal>
        <DialogOverlay>
          <DialogContent
            aria-describedby={undefined}
            onOpenAutoFocus={() => (trigger.current = document.activeElement as HTMLElement | null)}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              trigger.current?.focus();
            }}
            className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              <DialogClose
                aria-label={t("common.close")}
                className="grid h-11 w-11 place-items-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text"
              >
                <HiOutlineX aria-hidden="true" className="h-5 w-5" />
              </DialogClose>
            </div>
            <div className="p-4 md:p-6">{children}</div>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
}
export default Modal;
