/*
  Warnings:

  - The values [ADVANCED_USER] on the enum `USER_ROLE` will be removed. If these variants are still used in the database, this will fail.
  - The values [AWAITING_ADMINISTRATOR_APPROVAL,ACCESS_REJECTED_BY_ADMINISTRATOR] on the enum `USER_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "SYSTEM_MODE" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DOWN');

-- AlterEnum
BEGIN;
CREATE TYPE "USER_ROLE_new" AS ENUM ('USER', 'ADMINISTRATOR');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "USER_ROLE_new" USING ("role"::text::"USER_ROLE_new");
ALTER TYPE "USER_ROLE" RENAME TO "USER_ROLE_old";
ALTER TYPE "USER_ROLE_new" RENAME TO "USER_ROLE";
DROP TYPE "USER_ROLE_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "USER_STATUS_new" AS ENUM ('ACTIVE', 'INACTIVE', 'AWAITING_EMAIL_VALIDATION', 'DISABLED_BY_ADMINISTRATOR');
ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "USER_STATUS_new" USING ("status"::text::"USER_STATUS_new");
ALTER TYPE "USER_STATUS" RENAME TO "USER_STATUS_old";
ALTER TYPE "USER_STATUS_new" RENAME TO "USER_STATUS";
DROP TYPE "USER_STATUS_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'AWAITING_EMAIL_VALIDATION';
COMMIT;

-- AlterTable
ALTER TABLE "user_email_validations" ADD COLUMN     "valid" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'AWAITING_EMAIL_VALIDATION',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "settings" (
    "system_id" TEXT NOT NULL,
    "system_mode" "SYSTEM_MODE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("system_id")
);
