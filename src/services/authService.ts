import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";
import { User } from "../util/types";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../middleware/errors";

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
  const accountFound = await prisma.user.findUnique({ where: { email } });
  if (!accountFound) throw new NotFoundError("User not found");

  return email;
};
