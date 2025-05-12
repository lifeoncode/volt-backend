import { PrismaClient } from "../../generated/prisma";
import { User } from "../util/interface";

const prisma = new PrismaClient();

export const getUserService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("user not found");

  return user;
};

export const updateUserService = async (userId: number, userData: any) => {
  await getUserService(userId);
  await prisma.user.update({
    where: { id: userId },
    data: userData,
  });
  console.log(userData);
  return;
};

export const deleteUserService = async (userId: number) => {
  await getUserService(userId);
  await prisma.user.delete({ where: { id: userId } });
  return;
};
