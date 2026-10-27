import Joi from "joi";
import {
  MongoIDPattern,
  LIMITS,
  PROJECT_STATUS,
} from "../../../utils/constants";
import { apiError } from "../../../utils/apiResponse";
import { ERROR_CODES } from "../../../utils/errorCodes";

export const addProjectSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(LIMITS.PROJECT_TITLE_MIN)
    .max(LIMITS.PROJECT_TITLE_MAX)
    .error(apiError(400, ERROR_CODES.INVALID_PROJECT_TITLE, "عنوان محصول صحیح نمیباشد")),
  description: Joi.string()
    .required()
    .error(apiError(400, ERROR_CODES.INVALID_DESCRIPTION, "توضیحات ارسال شده صحیح نمیباشد")),
  tags: Joi.array()
    .min(0)
    .max(20)
    .error(apiError(400, ERROR_CODES.INVALID_TAGS, "برچسب ها نمیتواند بیشتر از 20 ایتم باشد")),
  category: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(apiError(400, ERROR_CODES.INVALID_CATEGORY, "دسته بندی مورد نظر  صحیح نمی باشد")),
  budget: Joi.number()
    .required()
    .min(LIMITS.PROJECT_BUDGET_MIN)
    .max(LIMITS.PROJECT_BUDGET_MAX)
    .error(apiError(400, ERROR_CODES.INVALID_PRICE, "قیمت وارد شده صحیح نمیباشد")),
  deadline: Joi.date()
    .required()
    .error(apiError(400, ERROR_CODES.INVALID_DEADLINE, "ددلاین پروژه را وارد کنید")),
});

export const changeProjectStatusSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid(...Object.values(PROJECT_STATUS))
    .error(apiError(400, ERROR_CODES.INVALID_PROJECT_STATUS, "وضعیت پروژه صحیح نمیباشد")),
});
