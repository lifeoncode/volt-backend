import {PrismaClient} from "../../generated/prisma";

const prisma = new PrismaClient();

export const registerService = async (username: string, email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) throw new Error("user already exists");

    const existingUsername = await prisma.user.findUnique({where: {username}});
    if (existingUsername) throw new Error("username taken");

    const newUser = await prisma.user.create({data:{username,email,password}});
    return {username:newUser.username, email:newUser.email};
}