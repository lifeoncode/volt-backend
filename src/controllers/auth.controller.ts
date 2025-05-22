import { Request, Response } from "express";
import { generateOTP, generateSecretKey, resolveErrorType, sendEmail } from "../util/helper";
import bcrypt from "bcryptjs";
import {
  registerService,
  loginService,
  recoverService,
  verifyOTPService,
  storeRecoveryOTPService,
} from "../services/auth.service";
import logger from "../middleware/logger";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../middleware/auth.middleware";
import path from "node:path";
import fs from "node:fs";
import { JWTPayload } from "../util/interface";
import { getUserService } from "../services/user.service";

/**
 * @controller register
 *
 * @description
 * Handles the creation of a new user account.
 *
 * @param {Request} req - Express request object. Expects an object as User in req.body
 * @param {Response} res - Express response object. Responds with the created object or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the creation of a new user account with the user's email address on success. Logs the error message on failure.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) throw new Error("missing credentials");
    if (password.length < 8) throw new Error("invalid password length");

    const secret = generateSecretKey();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await registerService(username, email, hashedPassword, secret);

    res.status(201).json(user);
    logger.info(`new user registered: ${user.email}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("missing credentials");

    const user = await loginService(email, password);
    const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ username: user.username, email: user.email, token: accessToken });
    logger.info(`${user.email} login success`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.status(200).json({ message: "logged out" });
    logger.info(`${req.user?.email} logout success`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error("No refresh token found in cookies");

    req.user = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JWTPayload;
    const accessToken = jwt.sign({ userId: req.user.userId, email: req.user.email }, JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    const user = await getUserService(Number(req.user.userId));

    res.status(200).json({ username: user.username, email: user.email, token: accessToken });
    logger.info("new access token generated");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

export const recover = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("email required");

    await recoverService(email);
    const otp = await storeRecoveryOTPService(email, generateOTP());
    if (!otp) throw new Error("could not store otp");

    const emailSent = await sendEmail(email, otp as string);
    if (!emailSent) throw new Error("Could not send email");

    res.status(200).json({ message: `recovery email sent` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

export const validateRecovery = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw new Error("missing credentials");

    const verified = await verifyOTPService(email, otp);

    res.status(200).json(verified);
    logger.info(verified);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};
