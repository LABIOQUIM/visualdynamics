-- AlterTable
ALTER TABLE "user_password_resets" ADD COLUMN     "usable" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
