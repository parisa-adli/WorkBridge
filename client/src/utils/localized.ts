import i18n from "../i18n";
import type { Category } from "../types/api";

type En<T> = T extends { translations?: { en?: infer E } } ? NonNullable<E> : never;

// In English, the field from translations.en when present; otherwise the Persian base field.
// Reads the language at render, so a switch swaps demo content without a refetch.
export default function localized<
  T extends { translations?: { en?: object } },
  K extends keyof En<T> & keyof T,
>(item: T, field: K): T[K] {
  const en = i18n.language === "en" ? (item.translations?.en as Partial<Pick<T, K>> | undefined) : undefined;
  return en?.[field] ?? item[field];
}

export function categoryName(category: Pick<Category, "title" | "englishTitle">) {
  return i18n.language === "en" ? category.englishTitle : category.title;
}
