import type { RequestHandler } from "express";
import type { z } from "zod";
import { apiError } from "../../../utils/apiResponse";
import { ERROR_CODES, type ErrorCode } from "../../../utils/errorCodes";

// A Zod issue keeps only its message, so each Persian message maps back to the code sent with it.
const codeByMessage = new Map<string, ErrorCode>();

// Zod's error param for a check: the Persian message, registered under its code.
export function issue(code: ErrorCode, message: string) {
  const known = codeByMessage.get(message);
  if (known && known !== code) throw new Error(`"${message}" is already used by ${known}`);
  codeByMessage.set(message, code);
  return { error: message };
}

// Replaces req.body with the parsed (trimmed, stripped) data, or rejects with the first failing field.
export function validate(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const [first] = result.error.issues;
      // an unregistered message is a schema bug; BAD_REQUEST makes the server tests flag it
      const code = codeByMessage.get(first.message) ?? ERROR_CODES.BAD_REQUEST;
      throw apiError(400, code, first.message, { field: first.path.join(".") });
    }
    req.body = result.data;
    next();
  };
}
