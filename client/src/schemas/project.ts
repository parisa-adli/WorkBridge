import { z } from "zod";
import { LIMITS } from "../constants";
import { msg, type Msg } from "./message";

// Mirrors server/app/http/validators/project.schema.ts: same limits, the form's messages (`validation.*` keys, fa keeps the old Persian text).

// Number inputs give strings ("" when empty); an edit form starts from the API's numbers.
export const numberField = (required: Msg, invalid: Msg, min: number, max: number) =>
  z
    .union([z.string(), z.number()], required)
    .transform((value) => (value === "" ? undefined : Number(value)))
    .pipe(z.number(required).min(min, invalid).max(max, invalid));

const invalidBudget = msg("validation.invalidAmount");

// tags and deadline live outside the form (TagInput, DatePickerField), so they are not in the schema.
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, msg("validation.titleRequired"))
    .min(LIMITS.PROJECT_TITLE_MIN, msg("validation.minChars", { min: LIMITS.PROJECT_TITLE_MIN }))
    .max(LIMITS.PROJECT_TITLE_MAX, msg("validation.maxChars", { max: LIMITS.PROJECT_TITLE_MAX })),
  description: z
    .string()
    .min(1, msg("validation.descriptionRequired"))
    .min(LIMITS.PROJECT_DESCRIPTION_MIN, msg("validation.minChars", { min: LIMITS.PROJECT_DESCRIPTION_MIN })),
  budget: numberField(msg("validation.budgetRequired"), invalidBudget, LIMITS.PROJECT_BUDGET_MIN, LIMITS.PROJECT_BUDGET_MAX),
  category: z.string().min(1, msg("validation.invalidCategory")),
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectValues = z.output<typeof projectSchema>;
