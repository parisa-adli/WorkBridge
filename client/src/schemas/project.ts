import { z } from "zod";
import { LIMITS } from "../constants";

// Mirrors server/app/http/validators/project.schema.ts: same limits, the form's Persian messages.

// Number inputs give strings ("" when empty); an edit form starts from the API's numbers.
export const numberField = (required: string, invalid: string, min: number, max: number) =>
  z
    .union([z.string(), z.number()], required)
    .transform((value) => (value === "" ? undefined : Number(value)))
    .pipe(z.number(required).min(min, invalid).max(max, invalid));

const invalidBudget = "مبلغ وارد شده نامعتبر است";

// tags and deadline live outside the form (TagsInput, DatePickerField), so they are not in the schema.
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان ضروری است")
    .min(LIMITS.PROJECT_TITLE_MIN, `حداقل ${LIMITS.PROJECT_TITLE_MIN} کاراکتر را وارد کنید`)
    .max(LIMITS.PROJECT_TITLE_MAX, `حداکثر ${LIMITS.PROJECT_TITLE_MAX} کاراکتر مجاز است`),
  description: z
    .string()
    .min(1, "توضیحات ضروری است")
    .min(LIMITS.PROJECT_DESCRIPTION_MIN, `حداقل ${LIMITS.PROJECT_DESCRIPTION_MIN} کاراکتر را وارد کنید`),
  budget: numberField("بودجه ضروری است", invalidBudget, LIMITS.PROJECT_BUDGET_MIN, LIMITS.PROJECT_BUDGET_MAX),
  category: z.string().min(1, "دسته بندی مورد نظر  صحیح نمی باشد"),
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectValues = z.output<typeof projectSchema>;
