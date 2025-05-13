import { Request, Response } from "express";
import { generateSecretKey, resolveErrorType, sendEmail } from "../util/helper";
import bcrypt from "bcryptjs";
import { registerService, loginService, recoverService } from "../services/auth.service";
import logger from "../middleware/logger";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/auth.middleware";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) throw new Error("missing credentials");
    if (password.length < 8) throw new Error("invalid password length");

    const secret = generateSecretKey();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await registerService(username, email, hashedPassword, secret);

    res.status(201).json(user);
    logger.info(`new user registered: ${user.email}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("missing credentials");

    const user = await loginService(email, password);
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
    logger.info(`${user.email} login success`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      const errorType: number = resolveErrorType(err.message);
      res.status(errorType).json({ message: err.message });
    }
  }
};

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
