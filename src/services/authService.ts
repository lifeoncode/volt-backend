import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";
import { User } from "../util/interface";

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
  if (existingUser) throw new Error("user already exists");

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) throw new Error("username taken");

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
  if (!user) throw new Error("user not found");
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) throw new Error("invalid credentials");

  return { id: user.id, username: user.username, email: user.email };
};

export const recoverService = async (email: string) => {
  const accountFound = await prisma.user.findUnique({ where: { email } });
  if (!accountFound) throw new Error("user not found");

  return email;
};

/**
 * @service storeRecoveryOTPService
 *
 * @description
 * Persists OTP in DB.
 *
 * @param {string} email - User email
 * @param {string} otp - Generated 4-digit pin
 *
 * @returns {string}
 */
export const storeRecoveryOTPService = async (email: string, otp: string): Promise<string | undefined> => {
  await recoverService(email);
  const { recovery_otp } = await prisma.user.update({ where: { email }, data: { recovery_otp: otp } });

  return recovery_otp?.toString();
};

/**
 * @service verifyOTPService
 *
 * @description
 * Verifies the OTP.
 *
 * @param {string} email - User email
 * @param {string} otp - Generated 4-digit pin
 *
 * @returns {string}
 */
export const verifyOTPService = async (email: string, otp: string): Promise<string> => {
  await recoverService(email);

  const otpMatch = await prisma.user.findFirst({ where: { recovery_otp: otp } });
  if (!otpMatch) throw new Error("invalid OTP");

  return "valid OTP";
};
