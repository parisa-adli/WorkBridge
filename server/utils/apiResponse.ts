import createHttpError from "http-errors";
import type { Response } from "express";
import type { ErrorCode } from "./errorCodes";

// Every success body. The client reads `data` (services return `data.data`).
export type ApiResponse<T> = { statusCode: number; data: T };
// Every error body, written by the central error handler in app/server.ts.
export type ApiErrorResponse = { statusCode: number; code: ErrorCode; message: string };

export function sendData<T>(res: Response, statusCode: number, data: T) {
  const body: ApiResponse<T> = { statusCode, data };
  return res.status(statusCode).json(body);
}

// An http-error carrying a stable code; `message` stays Persian.
export function apiError(status: number, code: ErrorCode, message: string) {
  return createHttpError(status, message, { code });
}
