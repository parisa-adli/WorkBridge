import { z } from "zod";
import { STATUS } from "../constants";

// Mirrors the server's proposal-status and verify-user schemas. The select gives "0" | "1" | "2"; the server takes the number.
const statusSchema = (message: string) =>
  z.object({ status: z.coerce.number<string | number>(message).pipe(z.literal(Object.values(STATUS), message)) });

export const proposalStatusSchema = statusSchema("وضعیت پروپوزال صحیح نمی باشد");
export const userStatusSchema = statusSchema("وضعیت کاربر صحیح نمی باشد");

export type StatusInput = z.input<typeof proposalStatusSchema>;
export type StatusValues = z.output<typeof proposalStatusSchema>;
