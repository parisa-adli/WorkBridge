import createError from "http-errors";
import Joi from "joi";
import { MongoIDPattern } from "../../../utils/constants";

export const addProposalSchema = Joi.object({
  description: Joi.string()
    .required()
    .error(createError.BadRequest("توضیحات ارسال شده صحیح نمیباشد")),
  price: Joi.number()
    .required()
    .error(createError.BadRequest("قیمت وارد شده صحیح نمیباشد")),
  duration: Joi.number()
    .required()
    .error(createError.BadRequest(" زمان انجام پروژه را وارد کنید")),
  projectId: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(createError.BadRequest("شناسه پروژه وارد شده صحیح نمیباشد")),
});

