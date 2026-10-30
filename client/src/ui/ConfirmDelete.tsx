import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmDeleteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  resourceName: string;
  // The button that opens it; focus returns to it on close.
  trigger: ReactNode;
  // The caller closes the dialog once the delete succeeds.
  onConfirm: () => void;
  disabled?: boolean;
  // Extra warning under the question.
  children?: ReactNode;
};

function ConfirmDelete({ open, onOpenChange, title, resourceName, trigger, onConfirm, disabled, children }: ConfirmDeleteProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{t("common.confirmDelete", { name: resourceName })}</AlertDialogDescription>
          {children}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault(); // stay open until the delete succeeds
              onConfirm();
            }}
          >
            {t("common.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default ConfirmDelete;
