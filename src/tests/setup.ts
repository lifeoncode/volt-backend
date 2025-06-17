import dotenv from "dotenv";
import { execSync } from "child_process";
import "../custom.d.ts";
import { InternalServerError } from "../middleware/errors";

dotenv.config({ path: ".env.test" });

if (!process.env.DATABASE_URL?.includes("volt_test")) {
  throw new InternalServerError("Not using test database! Aborting tests.");
}

execSync("npx prisma generate", { stdio: "inherit" });

let prisma: any;

beforeAll(async () => {
  const { PrismaClient } = await import("../../generated/prisma");
  prisma = new PrismaClient();

  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
