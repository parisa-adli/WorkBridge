import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Textfield from "../../../ui/Textfield";
import RHFSelect from "../../../ui/RHFSelect";
import Loading from "../../../ui/Loading";
import useCategories from "../../../hooks/useCategories";
import { CATEGORY_TYPES } from "../../../constants";
import { categorySchema, type CategoryValues } from "../../../schemas/category";
import type { Category } from "../../../types/api";
import useCreateCategory from "./useCreateCategory";
import useEditCategory from "./useEditCategory";

type CategoryFormProps = {
  onClose: () => void;
  categoryToEdit?: Category;
};

function CategoryForm({ onClose, categoryToEdit }: CategoryFormProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CategoryValues>({
    defaultValues: categoryToEdit
      ? {
          title: categoryToEdit.title,
          englishTitle: categoryToEdit.englishTitle,
          description: categoryToEdit.description,
          type: categoryToEdit.type as CategoryValues["type"],
        }
      : { type: "project", parentId: "" },
    resolver: zodResolver(categorySchema),
  });
  const { categories } = useCategories();
  const { isCreating, createCategory } = useCreateCategory();
  const { isEditing, editCategory } = useEditCategory();

  const onSubmit = (data: CategoryValues) => {
    // the edit form has no parent field, so parentId is undefined there
    if (categoryToEdit) {
      editCategory({ id: categoryToEdit._id, data }, { onSuccess: onClose });
    } else {
      createCategory(data, { onSuccess: onClose });
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <Textfield label={t("category.title")} name="title" register={register} required errors={errors} />
      <Textfield
        label={t("category.englishTitle")}
        name="englishTitle"
        register={register}
        required
        errors={errors}
      />
      <Textfield
        label={t("common.description")}
        name="description"
        register={register}
        required
        errors={errors}
      />
      <RHFSelect
        label={t("category.type")}
        name="type"
        register={register}
        required
        options={CATEGORY_TYPES.map((type) => ({ value: type, label: t(`category.types.${type}`) }))}
      />
      {!categoryToEdit && (
        <RHFSelect
          label={t("category.parent")}
          name="parentId"
          register={register}
          options={[{ value: "", label: t("category.noParent") }, ...categories]}
        />
      )}
      <div className="mt-8!">
        {isCreating || isEditing ? (
          <Loading />
        ) : (
          <button type="submit" className="btn btn--primary w-full">
            {t("common.confirm")}
          </button>
        )}
      </div>
    </form>
  );
}
export default CategoryForm;
