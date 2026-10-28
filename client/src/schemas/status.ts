import { z } from "zod";
import { STATUS } from "../constants";
import { msg, type Msg } from "./message";

// Mirrors the server's proposal-status and verify-user schemas. The select gives "0" | "1" | "2"; the server takes the number.
const statusSchema = (message: Msg) =>
  z.object({ status: z.coerce.number<string | number>(message).pipe(z.literal(Object.values(STATUS), message)) });

export const proposalStatusSchema = statusSchema(msg("validation.invalidProposalStatus"));
export const userStatusSchema = statusSchema(msg("validation.invalidUserStatus"));

export type StatusInput = z.input<typeof proposalStatusSchema>;
export type StatusValues = z.output<typeof proposalStatusSchema>;
