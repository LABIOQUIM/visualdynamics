-- AlterTable
ALTER TABLE "user_password_resets" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '10 min';
