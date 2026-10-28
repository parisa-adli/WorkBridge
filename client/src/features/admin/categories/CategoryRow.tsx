import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PiPencilSimpleLineBold, PiTrashBold } from "react-icons/pi";
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
            <PiPencilSimpleLineBold className="w-5 h-5 text-primary-900" />
          </button>
          <Modal
            title={t("category.edit", { title: name })}
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          >
            <CategoryForm categoryToEdit={category} onClose={() => setIsEditOpen(false)} />
          </Modal>
          <button onClick={() => setIsDeleteOpen(true)} title={t("category.delete", { title: name })}>
            <PiTrashBold className="w-5 h-5 text-error" />
          </button>
          <Modal
            title={t("category.delete", { title: name })}
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
          >
            {childCount > 0 && (
              <p className="text-error mb-4">{t("category.childrenWarning", { count: childCount })}</p>
            )}
            <ConfirmDelete
              recourseName={name}
              onClose={() => setIsDeleteOpen(false)}
              onConfirm={() =>
                removeCategory(category._id, { onSuccess: () => setIsDeleteOpen(false) })
              }
              disabled={isDeleting}
            />
          </Modal>
        </div>
      </td>
    </Table.Row>
  );
}
export default CategoryRow;
