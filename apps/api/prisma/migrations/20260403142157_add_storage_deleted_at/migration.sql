-- AlterTable
ALTER TABLE "simulation" ADD COLUMN     "storage_deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';
