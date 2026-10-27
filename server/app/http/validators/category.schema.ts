import Joi from "joi";
import { MongoIDPattern } from "../../../utils/constants";
import { apiError } from "../../../utils/apiResponse";
import { ERROR_CODES } from "../../../utils/errorCodes";

const invalidTitle = () =>
  apiError(400, ERROR_CODES.INVALID_CATEGORY_TITLE, "عنوان فارسی دسته بندی صحیح نمیباشد");
const invalidEnglishTitle = () =>
  apiError(400, ERROR_CODES.INVALID_CATEGORY_ENGLISH_TITLE, "عنوان انگلیسی دسته بندی صیحیح نمی باشد");
const invalidDescription = () =>
  apiError(400, ERROR_CODES.INVALID_CATEGORY_DESCRIPTION, "توضیحات دسته بندی صحیح نمی باشد");
const invalidType = () =>
  apiError(400, ERROR_CODES.INVALID_CATEGORY_TYPE, "نوع دسته بندی صحیح نمی باشد");

export const addCategorySchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(invalidTitle()),
  englishTitle: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(invalidEnglishTitle()),
  description: Joi.string()
    .required()
    .min(3)
    .max(200)
    .error(invalidDescription()),
  type: Joi.string()
    .required()
    .min(3)
    .max(100)
    .valid("project", "post", "comment", "ticket")
    .error(invalidType()),
  parent: Joi.string()
    .allow("")
    .pattern(MongoIDPattern)
    .error(apiError(400, ERROR_CODES.INVALID_ID, "شناسه ارسال شده صحیح نمیباشد")),
});

export const updateCategorySchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .error(invalidTitle()),
  englishTitle: Joi.string()
    .min(3)
    .max(100)
    .error(invalidEnglishTitle()),
  description: Joi.string()
    .required()
    .min(3)
    .max(200)
    .error(invalidDescription()),
  type: Joi.string()
    .required()
    .min(3)
    .max(100)
    .valid("product", "post", "comment", "ticket")
    .error(invalidType()),
});
