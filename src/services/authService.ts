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

/**
 * @service recoverService
 *
 * @description
 * Handles User account recovery by retrieving the relevant user by email
 *
 * @param {string} email - User username
 *
 * @returns {User}
 */
export const recoverService = async (email: string): Promise<User | null> => {
  const userFound = await prisma.user.findUnique({ where: { email } });
  if (!userFound) throw new NotFoundError("User not found");

  return userFound;
};

/**
 * @service createUserTokenService
 *
 * @description
 * Handles storing a user generated token for password reset or account verification
 *
 * @param {string} userId - User's id
 * @param {UserToken} userToken - The generated token
 *
 * @returns {UserToken}
 */
export const createUserTokenService = async (userId: string, userToken: UserToken): Promise<UserToken> => {
  const exists = await prisma.userTokens.findFirst({ where: { token: userToken.token } });
  if (exists && exists.used_at) throw new ConflictError("Token already used");

  const newToken = await prisma.userTokens.create({
    data: {
      token: userToken.token,
      expires_at: userToken.expires_at,
      user: { connect: { id: userId } },
    },
  });

  return newToken as UserToken;
};

/**
 * @service verifyUserTokenService
 *
 * @description
 * Handles verifying a user generated token for password reset or account verification
 *
 * @param {string} token - The user token to verify
 *
 * @returns {string}
 */
export const verifyUserTokenService = async (token: string): Promise<string> => {
  const foundToken = await prisma.userTokens.findFirst({ where: { token } });
  if (!foundToken) throw new NotFoundError("Token not found");
  if (foundToken?.used_at) throw new ConflictError("Token has already been used");
  if (foundToken.expires_at < new Date()) throw new UnauthorizedError("Token has expired");

  return foundToken.token;
};
