import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import CategoriesTable from "../features/admin/categories/CategoriesTable";
import CategoryForm from "../features/admin/categories/CategoryForm";

function Categories() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-black text-xl">{t("category.list")}</h1>
        <Modal title={t("category.addNew")} open={open} onClose={() => setOpen(false)}>
          <CategoryForm onClose={() => setOpen(false)} />
        </Modal>
        <Button onClick={() => setOpen(true)}>
          <Plus />
          <span>{t("category.add")}</span>
        </Button>
      </div>
      <CategoriesTable />
    </div>
  );
}
export default Categories;
