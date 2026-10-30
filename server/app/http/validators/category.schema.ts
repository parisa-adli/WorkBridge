import { z } from "zod";
import { MongoIDPattern } from "../../../utils/constants";
import { ERROR_CODES } from "../../../utils/errorCodes";
import { issue } from "../middlewares/validate";
import { invalidId } from "./common.schema";

const invalidTitle = issue(ERROR_CODES.INVALID_CATEGORY_TITLE, "عنوان فارسی دسته بندی صحیح نمیباشد");
const invalidEnglishTitle = issue(
  ERROR_CODES.INVALID_CATEGORY_ENGLISH_TITLE,
  "عنوان انگلیسی دسته بندی صیحیح نمی باشد"
);
const invalidDescription = issue(ERROR_CODES.INVALID_CATEGORY_DESCRIPTION, "توضیحات دسته بندی صحیح نمی باشد");
const invalidType = issue(ERROR_CODES.INVALID_CATEGORY_TYPE, "نوع دسته بندی صحیح نمی باشد");

const title = z.string(invalidTitle).min(3, invalidTitle).max(100, invalidTitle);
const englishTitle = z.string(invalidEnglishTitle).min(3, invalidEnglishTitle).max(100, invalidEnglishTitle);
const description = z.string(invalidDescription).min(3, invalidDescription).max(200, invalidDescription);
// the model's enum (update used to accept "product" instead of "project")
const type = z.enum(["project", "post", "comment", "ticket"], invalidType);

export const addCategorySchema = z.object({
  title,
  englishTitle,
  description,
  type,
  parentId: z
    .string(invalidId)
    .refine((value) => value === "" || MongoIDPattern.test(value), invalidId)
    .optional(),
});

export const updateCategorySchema = z.object({
  title: title.optional(),
  englishTitle: englishTitle.optional(),
  description,
  type,
});

export const categoryListQuerySchema = z.object({
  title: title.optional(),
  englishTitle: englishTitle.optional(),
  type: type.optional(),
});

export type AddCategoryBody = z.infer<typeof addCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
