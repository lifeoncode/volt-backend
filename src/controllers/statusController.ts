import { Request, Response } from "express";
import logger from "../middleware/logger";

export const serverStatus = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: "Systems nominal",
    });
    logger.info("status check...");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
