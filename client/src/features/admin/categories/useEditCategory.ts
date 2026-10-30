import useAppMutation from "../../../hooks/useAppMutation";
import { editCategoryApi } from "../../../services/categoryService";

export default function useEditCategory() {
  // project lists show the category's title
  const { isPending: isEditing, mutate: editCategory } = useAppMutation(
    editCategoryApi,
    [["categories"], ["projects"], ["owner-projects"], ["project"]]
  );
  return { isEditing, editCategory };
}
