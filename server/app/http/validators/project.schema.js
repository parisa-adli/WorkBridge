const createError = require("http-errors");
const Joi = require("joi");
const {
  MongoIDPattern,
  LIMITS,
  PROJECT_STATUS,
} = require("../../../utils/constants");

const addProjectSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(LIMITS.PROJECT_TITLE_MIN)
    .max(LIMITS.PROJECT_TITLE_MAX)
    .error(createError.BadRequest("عنوان محصول صحیح نمیباشد")),
  description: Joi.string()
    .required()
    .error(createError.BadRequest("توضیحات ارسال شده صحیح نمیباشد")),
  tags: Joi.array()
    .min(0)
    .max(20)
    .error(createError.BadRequest("برچسب ها نمیتواند بیشتر از 20 ایتم باشد")),
  category: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(createError.BadRequest("دسته بندی مورد نظر  صحیح نمی باشد")),
  budget: Joi.number()
    .required()
    .min(LIMITS.PROJECT_BUDGET_MIN)
    .max(LIMITS.PROJECT_BUDGET_MAX)
    .error(createError.BadRequest("قیمت وارد شده صحیح نمیباشد")),
  deadline: Joi.date()
    .required()
    .error(createError.BadRequest("ددلاین پروژه را وارد کنید")),
});

const changeProjectStatusSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid(...Object.values(PROJECT_STATUS))
    .error(createError.BadRequest("وضعیت پروژه صحیح نمیباشد")),
});

module.exports = {
  addProjectSchema,
  changeProjectStatusSchema,
};
