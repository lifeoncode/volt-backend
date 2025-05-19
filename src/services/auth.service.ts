import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const registerService = async (username: string, email: string, password: string, secret: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("user already exists");

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) throw new Error("username taken");

  const newUser = await prisma.user.create({
    data: { username, email, password, secret_key: secret },
  });

  return { id: newUser.id, username: newUser.username, email: newUser.email };
};

export const loginService = async (email: string, password: string) => {
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

export const storeRecoveryOTPService = async (email: string, otp: string) => {
  await recoverService(email);
  const { recovery_otp } = await prisma.user.update({ where: { email }, data: { recovery_otp: otp } });

  return recovery_otp;
};

export const verifyOTPService = async (email: string, otp: string) => {
  await recoverService(email);

  const otpMatch = await prisma.user.findFirst({ where: { recovery_otp: otp } });
  if (!otpMatch) throw new Error("invalid OTP");

  return "valid OTP";
};
