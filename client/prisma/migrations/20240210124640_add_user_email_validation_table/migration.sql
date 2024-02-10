-- AlterTable
ALTER TABLE "user_password_resets" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '10 min';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_email_validations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_email_validations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_validations_id_key" ON "user_email_validations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_validations_user_id_key" ON "user_email_validations"("user_id");

-- AddForeignKey
ALTER TABLE "user_email_validations" ADD CONSTRAINT "user_email_validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
