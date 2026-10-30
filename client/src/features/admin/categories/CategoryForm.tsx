import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../../ui/Input";
import RHFSelect from "../../../ui/RHFSelect";
import Button from "../../../ui/Button";
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
    control,
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
      <Input label={t("category.title")} required error={errors.title?.message} {...register("title")} />
      <Input label={t("category.englishTitle")} required error={errors.englishTitle?.message} {...register("englishTitle")} />
      <Input label={t("common.description")} required error={errors.description?.message} {...register("description")} />
      <RHFSelect
        label={t("category.type")}
        name="type"
        control={control}
        required
        options={CATEGORY_TYPES.map((type) => ({ value: type, label: t(`category.types.${type}`) }))}
      />
      {!categoryToEdit && (
        <RHFSelect
          label={t("category.parent")}
          name="parentId"
          control={control}
          options={[{ value: "", label: t("category.noParent") }, ...categories]}
        />
      )}
      <div className="mt-8!">
        {isCreating || isEditing ? (
          <Loading />
        ) : (
          <Button type="submit" className="w-full">
            {t("common.confirm")}
          </Button>
        )}
      </div>
    </form>
  );
}
export default CategoryForm;
