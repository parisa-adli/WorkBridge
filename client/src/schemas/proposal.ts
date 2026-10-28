import { z } from "zod";
import { LIMITS } from "../constants";
import { numberField } from "./project";
import { msg } from "./message";

// Mirrors server/app/http/validators/proposal.schema.ts: same limits, the form's messages (`validation.*` keys, fa keeps the old Persian text).
const invalidPrice = msg("validation.invalidAmount");
const invalidDuration = msg("validation.invalidDuration");

export const proposalSchema = z.object({
  description: z
    .string()
    .min(1, msg("validation.proposalDescriptionRequired")) // fa says "title is required" (pinned); en names the field
    .min(LIMITS.PROPOSAL_DESCRIPTION_MIN, msg("validation.minChars", { min: LIMITS.PROPOSAL_DESCRIPTION_MIN })),
  price: numberField(msg("validation.priceRequired"), invalidPrice, LIMITS.PROPOSAL_PRICE_MIN, LIMITS.PROPOSAL_PRICE_MAX),
  duration: numberField(
    msg("validation.durationRequired"),
    invalidDuration,
    LIMITS.PROPOSAL_DURATION_MIN,
    LIMITS.PROPOSAL_DURATION_MAX
  ),
});

export type ProposalInput = z.input<typeof proposalSchema>;
export type ProposalValues = z.output<typeof proposalSchema>;
