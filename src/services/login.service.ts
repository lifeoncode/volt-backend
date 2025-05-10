import {PrismaClient} from "../../generated/prisma";

const prisma = new PrismaClient()

export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) throw new Error("user not found");
    if (user.password !== password) throw new Error("invalid credentials");

    return { username: user.username, email: user.email};
}


