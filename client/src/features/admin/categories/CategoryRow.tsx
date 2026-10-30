import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import Modal from "../../../ui/Modal";
import Table from "../../../ui/Table";
import ConfirmDelete from "../../../ui/ConfirmDelete";
import type { Category } from "../../../types/api";
import { categoryName } from "../../../utils/localized";
import CategoryForm from "./CategoryForm";
import useRemoveCategory from "./useRemoveCategory";

type CategoryRowProps = {
  category: Category;
  index: number;
  parent?: Category;
  childCount: number;
};

function CategoryRow({ category, index, parent, childCount }: CategoryRowProps) {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { removeCategory, isDeleting } = useRemoveCategory();
  const name = categoryName(category);

  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>{category.title}</td>
      <td>{category.englishTitle}</td>
      <td>{t(`category.types.${category.type}`)}</td>
      <td>{parent ? categoryName(parent) : "-"}</td>
      <td>
        <div className="flex items-center gap-x-4">
          <button onClick={() => setIsEditOpen(true)} title={t("category.edit", { title: name })}>
            <PencilLine className="size-5 text-primary-900" />
          </button>
          <Modal
            title={t("category.edit", { title: name })}
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          >
            <CategoryForm categoryToEdit={category} onClose={() => setIsEditOpen(false)} />
          </Modal>
          <ConfirmDelete
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title={t("category.delete", { title: name })}
            resourceName={name}
            trigger={
              <button title={t("category.delete", { title: name })}>
                <Trash2 className="size-5 text-destructive" />
              </button>
            }
            onConfirm={() =>
              removeCategory(category._id, { onSuccess: () => setIsDeleteOpen(false) })
            }
            disabled={isDeleting}
          >
            {childCount > 0 && (
              <p className="text-sm text-destructive">{t("category.childrenWarning", { count: childCount })}</p>
            )}
          </ConfirmDelete>
        </div>
      </td>
    </Table.Row>
  );
}
export default CategoryRow;
