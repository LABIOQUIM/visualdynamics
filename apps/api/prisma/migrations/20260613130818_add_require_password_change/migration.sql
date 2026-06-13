-- AlterTable
ALTER TABLE "user" ADD COLUMN     "require_password_change" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
