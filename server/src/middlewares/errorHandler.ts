import { errorResponse } from "../utils/responses.js";
import { NextFunction, Request, Response } from "express";
import { fromError } from "zod-validation-error";

type ErrorWithStatus = Error & { status?: number };
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return errorResponse(res, 400, "Database operation failed");
  }

  if (err.name === "PrismaClientValidationError") {
    return errorResponse(res, 400, "Invalid data provided");
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const validationError = fromError(err);
    return errorResponse(
      res,
      400,
      validationError.toString() || "Validation failed"
    );
  }

  errorResponse(res, statusCode, message);
};
