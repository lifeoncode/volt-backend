import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const getUserService = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) throw new Error("user not found");

    return user;
}