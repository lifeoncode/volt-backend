import {PrismaClient} from "../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()

export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) throw new Error("user not found");
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) throw new Error("invalid credentials");

    return { id:user.id, username: user.username, email: user.email};
}


