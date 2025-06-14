import { Request, Response } from "express";
import { generateOTP, generateSecretKey, resolveErrorType, sendEmail } from "../util/helper";
import bcrypt from "bcryptjs";
import {
  registerService,
  loginService,
  recoverService,
  verifyOTPService,
  storeRecoveryOTPService,
} from "../services/authService";
import logger from "../middleware/logger";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../middleware/authMiddleware";
import path from "node:path";
import fs from "node:fs";
import { JWTPayload } from "../util/interface";
import { getUserService } from "../services/userService";

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
    await registerService(username, email, hashedPassword, secret);

    res.status(201).json({ user: { username, email } });
    logger.info(`new user registered: ${email}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

/**
 * @controller login
 *
 * @description
 * Handles user login.
 *
 * @param {Request} req - Express request object. Expects an object as User in req.body
 * @param {Response} res - Express response object. Responds with the User object with access token or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs login event with the user's email address on success. Logs the error message on failure.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
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

/**
 * @controller logout
 *
 * @description
 * Handles user logout.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object. Clears the refresh token stored in a browser cookie or responds with an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the logout event with the user's email address on success. Logs the error message on failure.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.status(200).json("logged out");
    logger.info("logout success");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

/**
 * @controller refreshToken
 *
 * @description
 * Handles the refreshing of the user's jwt access token.
 *
 * @param {Request} req - Express request object. Expects a a refresh token in req.cookies and an object as User in req.user
 * @param {Response} res - Express response object. Responds with the User object with access token or an error
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the token refresh event on success. Logs the error message on failure.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error("No refresh token found in cookies");

    req.user = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JWTPayload;
    const accessToken = jwt.sign({ userId: req.user.userId, email: req.user.email }, JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    const { username, email } = await getUserService(req.user.userId);

    res.status(200).json({ username, email, token: accessToken });
    logger.info("new access token generated");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

/**
 * @controller recover
 *
 * @description
 * Handles user account recovery.
 *
 * @param {Request} req - Express request object. Expects an email in req.body
 * @param {Response} res - Express response object. Responds with recovery email status - sent | failed to send
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the account recovery event with the user's email address on success. Logs the error message on failure.
 */
export const recover = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("email required");

    await recoverService(email);
    const otp = await storeRecoveryOTPService(email, generateOTP());
    if (!otp) throw new Error("could not store otp");

    const emailSent = await sendEmail(email, otp as string);
    if (!emailSent) throw new Error("Could not send email");

    res.status(200).json("recovery email sent");
    logger.info(`${email} - account recovery attempt`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      const errorType: number = resolveErrorType(error.message);
      res.status(errorType).json(error.message);
    }
  }
};

/**
 * @controller validateRecovery
 *
 * @description
 * Handles the validation of OTP to recover the user's account.
 *
 * @param {Request} req - Express request object. Expects {email, otp} in req.body
 * @param {Response} res - Express response object. Responds with validation success or failure
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the creation of a new user account with the user's email address on success. Logs the error message on failure.
 */
export const validateRecovery = async (req: Request, res: Response): Promise<void> => {
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
