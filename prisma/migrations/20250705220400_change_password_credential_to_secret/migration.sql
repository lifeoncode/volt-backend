/*
  Warnings:

  - You are about to drop the `PasswordCredential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswordCredential" DROP CONSTRAINT "PasswordCredential_user_id_fkey";

-- DropTable
DROP TABLE "PasswordCredential";

-- CreateTable
CREATE TABLE "Secret" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "service" TEXT NOT NULL,
    "service_user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
