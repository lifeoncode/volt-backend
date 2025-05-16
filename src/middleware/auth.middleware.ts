import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../util/interface";
import logger from "./logger";

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    logger.error("Unauthorized");
    return;
  }

  const token = authHeader?.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
    logger.error("Invalid token");
  }
};
