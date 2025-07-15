/*
  Warnings:

  - You are about to drop the `Vault` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_user_id_fkey";

-- DropTable
DROP TABLE "Vault";
