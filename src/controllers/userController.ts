import { Request, Response } from "express";
import logger from "../middleware/logger";
import { resolveErrorType } from "../util/helper";
import {
  deleteUserService,
  getUserService,
  updateUserPasswordService,
  updateUserService,
} from "../services/userService";
import { User } from "../util/types";
import bcrypt from "bcryptjs";
import { BadRequestError, UnprocessableEntityError } from "../middleware/errors";
const expressValidator = require("express-validator");
const { validationResult } = expressValidator;

/**
 * @controller getUser
 *
 * @description
 * Handles the retrieval of User.
 *
 * @param {Request} req - Express request object. Expects userId in req.user Obj
 * @param {Response} res - Express response object. Responds with User obj
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the User retrieval event with the user's email address on success. Logs the error message on failure.
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const userCredentials = await getUserService(userId);

  res.status(200).json({ username: userCredentials.username, email: userCredentials.email });
  logger.info(`user: ${userId} fetched user details`);
};

/**
 * @controller updateUser
 *
 * @description
 * Handles the updating of User details.
 *
 * @param {Request} req - Express request object. Expects userId in req.user Obj and an obj as User in req.body
 * @param {Response} res - Express response object. Responds with updated User obj
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the User updating event with the user's email address on success. Logs the error message on failure.
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  const { username, email, password }: User = req.body;
  if (!username && !email && !password) throw new BadRequestError("Username, Email or Password required");

  let newData: Record<string, any> = {};
  if (username) newData.username = username;
  if (email) newData.email = email;
  if (password) {
    if (password.length < 8) throw new BadRequestError("Password must be at least 8 characters");
    const hashedPassword = bcrypt.hashSync(password, 10);
    newData.password = hashedPassword;
  }

  const updatedUser = await updateUserService(userId, newData);
  res.status(200).json(updatedUser);
  logger.info(`user: ${userId} updated details`);
};

/**
 * @controller deleteUser
 *
 * @description
 * Handles deleting User account.
 *
 * @param {Request} req - Express request object. Expects userId in req.user Obj
 * @param {Response} res - Express response object. Responds with message
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the deletion event with the user's email address on success. Logs the error message on failure.
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.userId;
  if (!userId) throw new BadRequestError("User session not found");

  await deleteUserService(userId);

  logger.info(`user: ${req.user?.email} deleted account`);
  res.status(200).json({ message: "user deleted" });
};

/**
 * @controller resetUserPassword
 *
 * @description
 * Handles updating User account password on account recovery.
 *
 * @param {Request} req - Express request object. Expects {otp, email, password} in req.body
 * @param {Response} res - Express response object. Responds with message
 *
 * @returns {void}
 *
 * @sideEffects
 * Logs the password reset event with the user's email address on success. Logs the error message on failure.
 */
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array()[0];
    if (!err.value) throw new BadRequestError(err.msg);
    throw new UnprocessableEntityError(err.msg);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  await updateUserPasswordService(email, hashedPassword);

  res.status(200).json({ message: "Password has been reset" });
  logger.info(`user: ${email} password changed`);
};
