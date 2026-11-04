import useAppMutation from "../../../hooks/useAppMutation";
import { removeCategoryApi } from "../../../services/categoryService";

export default function useRemoveCategory() {
  const { isPending: isDeleting, mutate: removeCategory } = useAppMutation(
    removeCategoryApi,
    [["categories"]]
  );
  return { isDeleting, removeCategory };
}
