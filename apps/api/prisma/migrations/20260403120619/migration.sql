-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
