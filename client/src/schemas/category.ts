import { z } from "zod";
import { CATEGORY_TYPES, LIMITS } from "../constants";
import { msg } from "./message";

// Mirrors server/app/http/validators/category.schema.ts.
const text = (min: number, max: number) =>
  z
    .string()
    .min(min, msg("validation.minChars", { min }))
    .max(max, msg("validation.maxChars", { max }));

export const categorySchema = z.object({
  title: text(LIMITS.CATEGORY_TITLE_MIN, LIMITS.CATEGORY_TITLE_MAX),
  englishTitle: text(LIMITS.CATEGORY_TITLE_MIN, LIMITS.CATEGORY_TITLE_MAX),
  description: text(LIMITS.CATEGORY_DESCRIPTION_MIN, LIMITS.CATEGORY_DESCRIPTION_MAX),
  type: z.enum(CATEGORY_TYPES, msg("validation.invalidCategoryType")),
  // "" = no parent; only sent on create (update doesn't take it)
  parentId: z.string().optional(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
