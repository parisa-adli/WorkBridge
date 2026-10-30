import { z } from "zod";
import { LIMITS, PROJECT_STATUS } from "../../../utils/constants";
import { ERROR_CODES } from "../../../utils/errorCodes";
import { issue } from "../middlewares/validate";
import { numeric, objectId, pageQuery, searchQuery, sortQuery } from "./common.schema";

const invalidTitle = issue(ERROR_CODES.INVALID_PROJECT_TITLE, "عنوان محصول صحیح نمیباشد");
const invalidDescription = issue(ERROR_CODES.INVALID_DESCRIPTION, "توضیحات ارسال شده صحیح نمیباشد");
const invalidTags = issue(
  ERROR_CODES.INVALID_TAGS,
  `برچسب ها نمیتواند بیشتر از ${LIMITS.PROJECT_TAGS_MAX} ایتم باشد`
);
const invalidBudget = issue(ERROR_CODES.INVALID_PRICE, "قیمت وارد شده صحیح نمیباشد");
const invalidDeadline = issue(ERROR_CODES.INVALID_DEADLINE, "ددلاین پروژه را وارد کنید");
const invalidStatus = issue(ERROR_CODES.INVALID_PROJECT_STATUS, "وضعیت پروژه صحیح نمیباشد");

// Used by both add and update (an update sends the whole form).
export const addProjectSchema = z.object({
  title: z
    .string(invalidTitle)
    .min(LIMITS.PROJECT_TITLE_MIN, invalidTitle)
    .max(LIMITS.PROJECT_TITLE_MAX, invalidTitle),
  description: z.string(invalidDescription).min(LIMITS.PROJECT_DESCRIPTION_MIN, invalidDescription),
  tags: z.array(z.string(invalidTags), invalidTags).max(LIMITS.PROJECT_TAGS_MAX, invalidTags).optional(),
  category: objectId(issue(ERROR_CODES.INVALID_CATEGORY, "دسته بندی مورد نظر  صحیح نمی باشد")),
  budget: numeric(
    z.number(invalidBudget).min(LIMITS.PROJECT_BUDGET_MIN, invalidBudget).max(LIMITS.PROJECT_BUDGET_MAX, invalidBudget)
  ),
  // ISO string or timestamp, like Joi.date()
  deadline: z.preprocess(
    (value) => (typeof value === "string" || typeof value === "number" ? new Date(value) : value),
    z.date(invalidDeadline)
  ),
});

export const changeProjectStatusSchema = z.object({
  status: z.enum(PROJECT_STATUS, invalidStatus),
});

// Shared by /list and /owner-projects (buildProjectQuery); category is a comma list of englishTitles or ALL.
export const projectListQuerySchema = z.object({
  search: searchQuery,
  category: z.string(issue(ERROR_CODES.INVALID_CATEGORY, "دسته بندی مورد نظر صحیح نمی باشد")).optional(),
  status: z.enum(["ALL", ...Object.values(PROJECT_STATUS)], invalidStatus).optional(),
  sort: sortQuery,
  ...pageQuery,
});

export type AddProjectBody = z.infer<typeof addProjectSchema>;
export type ChangeProjectStatusBody = z.infer<typeof changeProjectStatusSchema>;
