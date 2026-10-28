import { useTranslation } from "react-i18next";
type ConfirmDeleteProps = {
  recourseName: string;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

function ConfirmDelete({ recourseName, onClose, onConfirm, disabled }: ConfirmDeleteProps) {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="font-bold text-base mb-8">
        {t("common.confirmDelete", { name: recourseName })}
      </h2>
      <div className="flex justify-between items-center gap-x-16">
        <button
          className="btn btn--primary flex-1"
          onClick={onClose}
          disabled={disabled}
        >
          {t("common.cancel")}
        </button>
        <button
          className="btn btn--danger py-3 flex-1"
          onClick={onConfirm}
          disabled={disabled}
        >
          {t("common.confirm")}
        </button>
      </div>
    </div>
  );
}
export default ConfirmDelete;
