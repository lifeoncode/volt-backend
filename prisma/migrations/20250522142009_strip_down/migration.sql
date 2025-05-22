/*
  Warnings:

  - You are about to drop the `AddressCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `email` on the `PasswordCredential` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `PasswordCredential` table. All the data in the column will be lost.
  - Added the required column `service_user_id` to the `PasswordCredential` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AddressCredential_street_key";

-- DropIndex
DROP INDEX "AddressCredential_label_key";

-- DropIndex
DROP INDEX "PaymentCredential_security_code_key";

-- DropIndex
DROP INDEX "PaymentCredential_card_number_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AddressCredential";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PaymentCredential";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordCredential" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "service" TEXT NOT NULL,
    "service_user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PasswordCredential_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PasswordCredential" ("createdAt", "id", "notes", "password", "service", "updatedAt", "user_id") SELECT "createdAt", "id", "notes", "password", "service", "updatedAt", "user_id" FROM "PasswordCredential";
DROP TABLE "PasswordCredential";
ALTER TABLE "new_PasswordCredential" RENAME TO "PasswordCredential";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
