/*
  Warnings:

  - You are about to drop the column `recovery_otp` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "recovery_otp";

-- CreateTable
CREATE TABLE "Vault" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "secrets" TEXT[],
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vault_label_key" ON "Vault"("label");

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
