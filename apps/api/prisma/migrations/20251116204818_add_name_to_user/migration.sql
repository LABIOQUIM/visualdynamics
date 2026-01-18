-- AlterTable
ALTER TABLE "user" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Name not set';

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
