import { PrismaClient } from "../../generated/prisma";

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

  return;
};

export const updateUserPasswordService = async (email: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error("user not found");
  const updatedUser = await prisma.user.update({ where: { email }, data: { password: newPassword } });
  return updatedUser;
};

export const deleteUserService = async (userId: number) => {
  await getUserService(userId);
  await prisma.passwordCredential.deleteMany({ where: { user_id: userId } });
  await prisma.user.delete({ where: { id: userId } });

  return;
};
