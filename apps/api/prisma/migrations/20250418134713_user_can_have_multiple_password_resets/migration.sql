-- DropIndex
DROP INDEX "user_password_resets_user_id_key";

-- AlterTable
ALTER TABLE "user_password_resets" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
