import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../util/types";
import logger from "./logger";
import { UnauthorizedError } from "./errors";

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

/**
 * @middleware authenticate
 *
 * @description
 * Handles User authentication and authorization.
 *
 * @param {Request} req - Express request object. Expects access_token in req.headers.authorization
 * @param {Response} res - Express response object. Responds with message - unauthorized | invalid token
 * @param {NextFunction} next - Express next function. Performs the "next" operation after auth process
 *
 * @returns {void}
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    logger.error("Unauthorized");
    throw new UnauthorizedError();
  }

  const token = authHeader?.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
    next();
  } catch (err) {
    logger.error("Invalid token");
    throw new UnauthorizedError();
  }
};

export const authenticatePasswordReset = (req: Request, res: Response, next: NextFunction): void => {};
