import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const recoverService = async (email: string) => {
  const accountFound = await prisma.user.findUnique({ where: { email } });
  if (!accountFound) throw new Error("user not found");

  return email;
};
