-- AlterTable
ALTER TABLE "user" ALTER COLUMN "ban_expires" DROP NOT NULL,
ALTER COLUMN "ban_reason" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
