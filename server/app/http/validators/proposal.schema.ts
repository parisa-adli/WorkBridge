import { z } from "zod";
import { LIMITS, STATUS } from "../../../utils/constants";
import { ERROR_CODES } from "../../../utils/errorCodes";
import { issue } from "../middlewares/validate";
import { numeric, objectId, sortQuery } from "./common.schema";

const invalidDescription = issue(ERROR_CODES.INVALID_DESCRIPTION, "توضیحات ارسال شده صحیح نمیباشد");
const invalidPrice = issue(ERROR_CODES.INVALID_PRICE, "قیمت وارد شده صحیح نمیباشد");
const invalidDuration = issue(ERROR_CODES.INVALID_DURATION, " زمان انجام پروژه را وارد کنید");
const invalidStatus = issue(ERROR_CODES.INVALID_PROPOSAL_STATUS, "وضعیت پروپوزال صحیح نمی باشد");

export const addProposalSchema = z.object({
  description: z.string(invalidDescription).min(LIMITS.PROPOSAL_DESCRIPTION_MIN, invalidDescription),
  price: numeric(
    z.number(invalidPrice).min(LIMITS.PROPOSAL_PRICE_MIN, invalidPrice).max(LIMITS.PROPOSAL_PRICE_MAX, invalidPrice)
  ),
  duration: numeric(
    z
      .number(invalidDuration)
      .min(LIMITS.PROPOSAL_DURATION_MIN, invalidDuration)
      .max(LIMITS.PROPOSAL_DURATION_MAX, invalidDuration)
  ),
  projectId: objectId(issue(ERROR_CODES.INVALID_PROJECT_ID, "شناسه پروژه وارد شده صحیح نمیباشد")),
});

export const changeProposalStatusSchema = z.object({
  status: numeric(z.literal(Object.values(STATUS), invalidStatus)),
});

export const proposalListQuerySchema = z.object({ sort: sortQuery });

export type AddProposalBody = z.infer<typeof addProposalSchema>;
export type ChangeProposalStatusBody = z.infer<typeof changeProposalStatusSchema>;
