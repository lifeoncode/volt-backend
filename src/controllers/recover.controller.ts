import { Request, Response } from "express";
import { resolveErrorType, sendEmail } from "../util/helper";
import logger from "../middleware/logger";
import { recoverService } from "../services/recover.service";

export const recover = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("email required");

    await recoverService(email);

    const emailSent = await sendEmail(email);
    if (!emailSent) throw new Error("Could not send email");

    res.status(200).json({ message: `recovery email sent` });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};
