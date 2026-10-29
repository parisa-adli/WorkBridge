import { useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "./Button";

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
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        onOpenAutoFocus={() => (trigger.current = document.activeElement as HTMLElement | null)}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          trigger.current?.focus();
        }}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md"
      >
        {/* The close button sits in the header, before the content, so it takes focus first. */}
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label={t("common.close")}>
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export default Modal;
