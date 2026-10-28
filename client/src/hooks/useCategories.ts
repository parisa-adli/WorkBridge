import { useQuery } from "@tanstack/react-query";
import { getCategoryApi } from "../services/categoryService";
import { categoryName } from "../utils/localized";

export default function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoryApi,
  });

  const { categories: rawCategories = [] } = data || {};

  const categories = rawCategories.map((item) => ({
    label: categoryName(item),
    value: item._id,
  }));

  const transformedCategories = rawCategories.map((item) => ({
    label: categoryName(item),
    value: item.englishTitle,
  }));

  return { isLoading, rawCategories, categories, transformedCategories };
}
