import { Request, Response } from "express";
import { resolveErrorType } from "../util/helper";
import logger from "../middleware/logger";

export const recover = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json("email required");
    }
    res.status(200).json({ message: `an account recovery email has been sent to ${email}` });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};
