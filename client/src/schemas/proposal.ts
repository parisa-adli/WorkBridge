import { z } from "zod";
import { LIMITS } from "../constants";
import { numberField } from "./project";

// Mirrors server/app/http/validators/proposal.schema.ts: same limits, the form's Persian messages.
const invalidPrice = "مبلغ وارد شده نامعتبر است";
const invalidDuration = "مدت زمان مجاز نمی باشد";

export const proposalSchema = z.object({
  description: z
    .string()
    .min(1, "عنوان ضروری است")
    .min(LIMITS.PROPOSAL_DESCRIPTION_MIN, `حداقل ${LIMITS.PROPOSAL_DESCRIPTION_MIN} کاراکتر را وارد کنید`),
  price: numberField("قیمت ضروری است", invalidPrice, LIMITS.PROPOSAL_PRICE_MIN, LIMITS.PROPOSAL_PRICE_MAX),
  duration: numberField(
    "مدت زمان ضروری است",
    invalidDuration,
    LIMITS.PROPOSAL_DURATION_MIN,
    LIMITS.PROPOSAL_DURATION_MAX
  ),
});

export type ProposalInput = z.input<typeof proposalSchema>;
export type ProposalValues = z.output<typeof proposalSchema>;
