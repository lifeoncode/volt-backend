import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";
import { User, UserToken } from "../util/types";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../middleware/errors";
import { getUserService } from "./userService";

const prisma = new PrismaClient();

/**
 * @service registerService
 *
 * @description
 * Persists a new User in DB.
 *
 * @param {string} username - User username
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} secret - Secret generated once and used for User data encryption
 *
 * @returns {User}
 */
export const registerService = async (
  username: string,
  email: string,
  password: string,
  secret: string
): Promise<User> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ConflictError("User already exists");

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) throw new ConflictError("Username taken");

  const newUser = await prisma.user.create({
    data: { username, email, password, secret_key: secret },
  });

  return newUser;
};

/**
 * @service loginService
 *
 * @description
 * Handles User login.
 *
 * @param {string} email - User username
 * @param {string} password - User password
 *
 * @returns {User}
 */
export const loginService = async (email: string, password: string): Promise<Record<string, unknown>> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("User not found");

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) throw new BadRequestError("Invalid credentials");

  return { id: user.id, username: user.username, email: user.email };
};

export const recoverService = async (email: string) => {
  const userFound = await prisma.user.findUnique({ where: { email } });
  if (!userFound) throw new NotFoundError("User not found");

  return userFound;
};

export const createUserTokenService = async (userId: string, userToken: UserToken) => {
  const exists = await prisma.userTokens.findFirst({ where: { token: userToken.token } });
  if (exists && exists.used_at) throw new ConflictError("Token already used");

  const newToken = await prisma.userTokens.create({
    data: {
      token: userToken.token,
      expires_at: userToken.expires_at,
      user: { connect: { id: userId } },
    },
  });

  return newToken;
};

export const verifyUserTokenService = async (token: string) => {
  const foundToken = await prisma.userTokens.findFirst({ where: { token } });
  if (!foundToken) throw new NotFoundError("Token not found");
  if (foundToken?.used_at) throw new ConflictError("Token has already been used");
  if (foundToken.expires_at < new Date()) throw new UnauthorizedError("Token has expired");

  return foundToken.token;
};
