import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Textfield from "../../ui/Textfield";
import RHFSelect from "../../ui/RHFSelect";
import { TagsInput } from "react-tag-input-component";
import { useState } from "react";
import DatePickerField from "../../ui/DatePickerField";
import useCategories from "../../hooks/useCategories";
import useCreateProject from "./useCreateProject";
import Loading from "../../ui/Loading";
import useEditProject from "./useEditProject";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import type DateObject from "react-date-object";
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
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProjectInput, unknown, ProjectValues>({
    defaultValues: editValues,
    resolver: zodResolver(projectSchema),
  });

  const [tags, setTags] = useState(prevTags || []);
  const [date, setDate] = useState<Date | DateObject | null>(
    deadline ? new Date(deadline) : null
  );
  const { categories } = useCategories();
  const { isCreating, createProject } = useCreateProject();
  const { isEditing, editProject } = useEditProject();

  const onSubmit = (data: ProjectValues) => {
    if (!date) return toast.error(t("validation.deadlineRequired"));
    const newProject = {
      ...data,
      deadline: new Date(date.valueOf()).toISOString(),
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
      <Textfield
        label={t("project.title")}
        name="title"
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
      <Textfield
        label={t("project.budget")}
        name="budget"
        type="number"
        register={register}
        required
        errors={errors}
      />
      <RHFSelect
        label={t("project.category")}
        required
        name="category"
        register={register}
        options={categories}
      />
      <div>
        <label htmlFor="tags" className="mb-2 block text-secondary-700">
          {t("project.tag")}
        </label>
        <TagsInput value={tags} onChange={setTags} name="tags" />
      </div>
      <DatePickerField date={date} setDate={setDate} label={t("project.deadline")} />
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
