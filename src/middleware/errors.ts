import { NextFunction, Request, Response } from "express";
import logger from "./logger";
import { isDev } from "../util/helper";

/**
 * @Class AppError
 *
 * @description
 * Extends default Error obj with custom attributes for better error handling.
 * Has multiple 'children' Error classes for specific error types
 *
 */
class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity") {
    super(message, 422);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable") {
    super(message, 503);
  }
}

export class BadGatewayError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 502);
  }
}

/**
 * @middleware errorHandler
 *
 * @description
 * Handles application errors.
 *
 * @param {AppError} error - Custom error class extending Error.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object. Responds with message - route not found
 * @param {NextFunction} next - Express NextFunction object
 *
 * @returns {void}
 *
 */
export const errorHandler = async (error: AppError, req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.error(error.message);
  res.status(error.statusCode).send({ error: { message: error.message, ...(isDev() && { stack: error.stack }) } });
};
