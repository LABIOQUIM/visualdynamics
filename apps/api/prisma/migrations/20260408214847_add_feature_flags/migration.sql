-- CreateEnum
CREATE TYPE "FEATURE_FLAG_TYPE" AS ENUM ('BOOLEAN', 'STRING', 'NUMBER');

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';

-- CreateTable
CREATE TABLE "feature_flag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "FEATURE_FLAG_TYPE" NOT NULL DEFAULT 'BOOLEAN',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "default_variant" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "feature_flag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_flag_key_key" ON "feature_flag"("key");

-- CreateIndex
CREATE INDEX "feature_flag_key_idx" ON "feature_flag"("key");
