import { Request, Response } from "express";
import logger from "../middleware/logger";
import { resolveErrorType } from "../util/helper";
import {
  deleteUserService,
  getUserService,
  updateUserPasswordService,
  updateUserService,
} from "../services/user.service";
import { User } from "../util/interface";
import bcrypt from "bcryptjs";

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
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new Error("user session not found");

    const userCredentials = await getUserService(userId);
    res.status(200).json({ username: userCredentials.username, email: userCredentials.email });
    logger.info(`user: ${userCredentials.email} fetched their user credentials`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json({ message: err.message });
    }
  }
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
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new Error("user session not found");

    const { username, email, password }: User = req.body;
    if (!username && !email && !password) throw new Error("missing credentials");

    let newData: Record<string, any> = {};
    if (username) newData.username = username;
    if (email) newData.email = email;
    if (password) {
      if (password.length < 8) throw new Error("invalid password length");
      const hashedPassword = bcrypt.hashSync(password, 10);
      newData.password = hashedPassword;
    }

    const updatedUser = await updateUserService(userId, newData);
    res.status(200).json(updatedUser);
    logger.info(`user: ${req.user?.email} updated their user credentials`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json({ message: err.message });
    }
  }
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
  try {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new Error("user session not found");
    await deleteUserService(userId);
    logger.info(`user: ${req.user?.email} deleted their account`);
    res.status(200).json({ message: "user deleted" });
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json(err.message);
    }
  }
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
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { otp, email, password } = req.body;
    if (!otp || !email || !password) throw new Error("missing credentials");
    if (password.length < 8) throw new Error("invalid password length");

    const hashedPassword = bcrypt.hashSync(password, 10);
    await updateUserPasswordService(email, hashedPassword);

    res.status(200).json({ message: "password reset successful" });
    logger.info(`user: ${email} changed their password`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json({ message: err.message });
    }
  }
};
