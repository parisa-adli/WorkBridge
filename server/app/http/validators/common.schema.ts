import { z } from "zod";
import { MongoIDPattern } from "../../../utils/constants";
import { ERROR_CODES } from "../../../utils/errorCodes";
import { issue } from "../middlewares/validate";

export const invalidId = issue(ERROR_CODES.INVALID_ID, "شناسه ارسال شده صحیح نمیباشد");

export const objectId = (error = invalidId) => z.string(error).regex(MongoIDPattern, error);

// Forms and selects send numbers as strings; like Joi, read a non-blank numeric string as its number.
export const numeric = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : value), schema);

export const idParamSchema = z.object({ id: objectId() });
export const userIdParamSchema = z.object({ userId: objectId() });

// A single query value: `?sort=a&sort=b` arrives as an array and is rejected.
export const sortQuery = z.string(issue(ERROR_CODES.INVALID_SORT, "ترتیب نمایش صحیح نمی باشد")).optional();
export const searchQuery = z.string(issue(ERROR_CODES.INVALID_SEARCH, "عبارت جستجو صحیح نمی باشد")).optional();
