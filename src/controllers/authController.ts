import { Request, Response } from "express";
import { generateSecretKey } from "../util/helper";
import bcrypt from "bcryptjs";
import {
  registerService,
  loginService,
  recoverService,
  createUserTokenService,
  verifyUserTokenService,
} from "../services/authService";
import logger from "../middleware/logger";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../middleware/authMiddleware";
import { JWTPayload } from "../util/types";
import { getUserService } from "../services/userService";
import crypto from "crypto";
import { BadGatewayError, BadRequestError, UnauthorizedError, UnprocessableEntityError } from "../middleware/errors";
import { passwordResetTemplate, sendEmail } from "../lib/email";
const expressValidator = require("express-validator");
const { validationResult } = expressValidator;

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
  const { username, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array()[0];
    if (!err.value) throw new BadRequestError(err.msg);
    throw new UnprocessableEntityError(err.msg);
  }

  const secret = generateSecretKey();
  const hashedPassword = bcrypt.hashSync(password, 10);
  await registerService(username, email, hashedPassword, secret);

  res.status(201).json({ message: "New user registered", data: { username, email } });
  logger.info(`new user registered: ${email}`);
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
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array()[0];
    if (!err.value) throw new BadRequestError(err.msg);
    throw new UnprocessableEntityError(err.msg);
  }

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

  res
    .status(200)
    .json({ message: "Login successful", data: { username: user.username, email: user.email, token: accessToken } });
  logger.info(`${user.email} login success`);
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
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logout successful" });
  logger.info("logout success");
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
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new UnauthorizedError("Refresh token not found");

  req.user = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JWTPayload;
  const accessToken = jwt.sign({ userId: req.user.userId, email: req.user.email }, JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const { username, email } = await getUserService(req.user.userId);

  res.status(200).json({ message: "Access token refreshed", data: { username, email, token: accessToken } });
  logger.info("new access token generated");
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
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array()[0];
    if (!err.value) throw new BadRequestError(err.msg);
    throw new UnprocessableEntityError(err.msg);
  }

  const user = await recoverService(email);

  const now = new Date();
  const newToken = await createUserTokenService(user.id, {
    token: generateSecretKey(),
    expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  });

  const emailSent = sendEmail(email, passwordResetTemplate(newToken.token));
  if (!emailSent) throw new BadGatewayError("Could not send email");

  res.status(200).json({ message: "Recovery email sent" });
  logger.info(`${email} - account recovery attempt`);
};

export const verifyUserToken = async (req: Request, res: Response) => {
  const { token } = req.query;
  const verifiedToken = await verifyUserTokenService(token as string);

  res.status(200).json({ message: "Valid token", data: { token: verifiedToken } });
  logger.info(`Valid user token`);
};
