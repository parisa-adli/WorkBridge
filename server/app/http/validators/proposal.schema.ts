import Joi from "joi";
import { MongoIDPattern } from "../../../utils/constants";
import { apiError } from "../../../utils/apiResponse";
import { ERROR_CODES } from "../../../utils/errorCodes";

export const addProposalSchema = Joi.object({
  description: Joi.string()
    .required()
    .error(apiError(400, ERROR_CODES.INVALID_DESCRIPTION, "توضیحات ارسال شده صحیح نمیباشد")),
  price: Joi.number()
    .required()
    .error(apiError(400, ERROR_CODES.INVALID_PRICE, "قیمت وارد شده صحیح نمیباشد")),
  duration: Joi.number()
    .required()
    .error(apiError(400, ERROR_CODES.INVALID_DURATION, " زمان انجام پروژه را وارد کنید")),
  projectId: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(apiError(400, ERROR_CODES.INVALID_PROJECT_ID, "شناسه پروژه وارد شده صحیح نمیباشد")),
});
