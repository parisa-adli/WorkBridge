import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Input from "../../ui/Input";
import RHFSelect from "../../ui/RHFSelect";
import { useState } from "react";
import DatePickerField from "../../ui/DatePickerField";
import TagInput from "../../ui/TagInput";
import useCategories from "../../hooks/useCategories";
import useCreateProject from "./useCreateProject";
import Button from "../../ui/Button";
import Loading from "../../ui/Loading";
import useEditProject from "./useEditProject";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Project } from "../../types/api";
import { projectSchema, type ProjectInput, type ProjectValues } from "../../schemas/project";

type CreateProjectFormProps = {
  onClose: () => void;
  projectToEdit?: Partial<Project>;
};

function CreateProjectForm({ onClose, projectToEdit = {} }: CreateProjectFormProps) {
  const { t } = useTranslation();
  const { _id: editId } = projectToEdit;
  const isEditSession = Boolean(editId);

  const {
    title,
    description,
    budget,
    deadline,
    category,
    tags: prevTags,
  } = projectToEdit;

  let editValues: Partial<ProjectInput> = {};

  if (isEditSession) {
    editValues = {
      title,
      description,
      budget,
      category: category?._id,
    };
  }

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProjectInput, unknown, ProjectValues>({
    defaultValues: editValues,
    resolver: zodResolver(projectSchema),
  });

  const [tags, setTags] = useState(prevTags || []);
  const [date, setDate] = useState<Date | null>(
    deadline ? new Date(deadline) : null
  );
  const { categories } = useCategories();
  const { isCreating, createProject } = useCreateProject();
  const { isEditing, editProject } = useEditProject();

  const onSubmit = (data: ProjectValues) => {
    if (!date) return toast.error(t("validation.deadlineRequired"));
    const newProject = {
      ...data,
      deadline: date.toISOString(),
      tags,
    };
    if (editId) {
      editProject(
        { id: editId, newProject },
        {
          onSuccess: () => {
            onClose();
            reset();
          },
        }
      );
    } else {
      createProject(newProject, {
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <Input label={t("project.title")} required error={errors.title?.message} {...register("title")} />
      <Input label={t("common.description")} required error={errors.description?.message} {...register("description")} />
      <Input label={t("project.budget")} type="number" required error={errors.budget?.message} {...register("budget")} />
      <RHFSelect
        label={t("project.category")}
        required
        name="category"
        control={control}
        options={categories}
      />
      <TagInput label={t("project.tag")} value={tags} onChange={setTags} />
      <DatePickerField date={date} setDate={setDate} label={t("project.deadline")} />
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
export default CreateProjectForm;

// title, desc, category, tags, budget, deadline
// input : text | number
// category => select option
// tags = multi input
// deadline => date picker

// title => 8 chrs, password : 8, Aa12%#, ... => (validation)

// validation:
// front-end : necessary, not efficient => formik, REACT-HOOK-FORM
// REACT-HOOK-FORM => (simple to learn, optimum)
// managing state, submit form, validation
// back-end : OK!
