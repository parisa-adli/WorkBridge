const createError = require("http-errors");
const Joi = require("joi");
const { MongoIDPattern } = require("../../../utils/constants");

const addProjectSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(30)
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
    .error(createError.BadRequest("قیمت وارد شده صحیح نمیباشد")),
  deadline: Joi.date()
    .required()
    .error(createError.BadRequest("ددلاین پروژه را وارد کنید")),
});

const changeProjectStatusSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid("OPEN", "CLOSED")
    .error(createError.BadRequest("وضعیت پروژه صحیح نمیباشد")),
});

module.exports = {
  addProjectSchema,
  changeProjectStatusSchema,
};
