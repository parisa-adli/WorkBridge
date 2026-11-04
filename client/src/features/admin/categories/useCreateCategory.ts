import useAppMutation from "../../../hooks/useAppMutation";
import { createCategoryApi } from "../../../services/categoryService";

export default function useCreateCategory() {
  const { isPending: isCreating, mutate: createCategory } = useAppMutation(
    createCategoryApi,
    [["categories"]]
  );
  return { isCreating, createCategory };
}
