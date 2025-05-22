import { PrismaClient } from "../../generated/prisma";
import { User } from "../util/interface";

const prisma = new PrismaClient();

/**
 * @service getUserService
 *
 * @description
 * Queries DB for a User.
 *
 * @param {number} userId - User id
 *
 * @returns {User}
 */
export const getUserService = async (userId: number): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("user not found");

  return user;
};

/**
 * @service updateUserService
 *
 * @description
 * Persists updated User in DB
 *
 * @param {number} userId - User id
 * @param {Record<string, unknown>} userData - User attributes
 *
 * @returns {User}
 */
export const updateUserService = async (userId: number, userData: any): Promise<User> => {
  await getUserService(userId);
  const user = await prisma.user.update({
    where: { id: userId },
    data: userData,
  });

  return user;
};

/**
 * @service updateUserPasswordService
 *
 * @description
 * Persists updates User password.
 *
 * @param {String} email - User id
 * @param {String} newPassword - User attribute {password}
 *
 * @returns {User}
 */
export const updateUserPasswordService = async (email: string, newPassword: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error("user not found");
  const updatedUser = await prisma.user.update({ where: { email }, data: { password: newPassword } });

  return updatedUser;
};

/**
 * @service getUserService
 *
 * @description
 * Removes User from DB.
 *
 * @param {number} userId - User id
 *
 * @returns {User}
 */
export const deleteUserService = async (userId: number): Promise<User> => {
  await getUserService(userId);
  await prisma.passwordCredential.deleteMany({ where: { user_id: userId } });

  return prisma.user.delete({ where: { id: userId } });
};
