import { useEffect, useId, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineX } from "react-icons/hi";
import useOutsideClick from "../hooks/useOutsideClick";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useTranslation();
  const ref = useOutsideClick<HTMLDivElement>(onClose);
  const titleId = useId();

  // Focus moves into the dialog on open and back to whatever had it (the trigger) on close.
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    (ref.current?.querySelector<HTMLElement>(FOCUSABLE) ?? ref.current)?.focus();
    return () => trigger?.focus();
  }, [open, ref]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") return onClose();
    if (e.key !== "Tab" || !ref.current) return;
    const focusable = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto
            rounded-lg border border-border bg-surface text-text shadow-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="grid h-11 w-11 place-items-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text"
            >
              <HiOutlineX aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    )
  );
}
export default Modal;
