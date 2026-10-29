import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import CategoriesTable from "../features/admin/categories/CategoriesTable";
import CategoryForm from "../features/admin/categories/CategoryForm";

function Categories() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-black text-secondary-700 text-xl">{t("category.list")}</h1>
        <Modal title={t("category.addNew")} open={open} onClose={() => setOpen(false)}>
          <CategoryForm onClose={() => setOpen(false)} />
        </Modal>
        <button className="btn btn--primary flex items-center gap-x-2" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          <span>{t("category.add")}</span>
        </button>
      </div>
      <CategoriesTable />
    </div>
  );
}
export default Categories;
