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

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId: number | undefined = req.user?.userId;
    const userCredentials = await getUserService(Number(userId));
    res.status(200).json({ username: userCredentials.username, email: userCredentials.email });
    logger.info(`user: ${userCredentials.email} fetched their user credentials`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json({ message: err.message });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId: number | undefined = req.user?.userId;
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

    await updateUserService(Number(userId), newData);
    res.status(200).json({ message: "user updated" });
    logger.info(`user: ${req.user?.email} updated their user credentials`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json({ message: err.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId: number | undefined = req.user?.userId;
    await deleteUserService(Number(userId));
    logger.info(`user: ${req.user?.email} deleted their account`);
    res.status(200).json({ message: "user deleted" });
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json(err.message);
    }
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { otp, email, password } = req.body;
    if (!otp || !email || !password) throw new Error("missing credentials");
    if (password.length < 8) throw new Error("invalid password length");

    const hashedPassword = bcrypt.hashSync(password, 10);
    const updatedUser = await updateUserPasswordService(email, hashedPassword);

    res.status(200).json(updatedUser);
    logger.info(`user: ${email} changed their password`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      res.status(resolveErrorType(err.message)).json({ message: err.message });
    }
  }
};
