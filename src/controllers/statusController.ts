import { Request, Response } from "express";
import logger from "../middleware/logger";
import { InternalServerError } from "../middleware/errors";

export const serverStatus = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: "Systems nominal",
    });
    logger.info("status check...");
  } catch (error) {
    logger.error(error);
    throw new InternalServerError();
  }
};
