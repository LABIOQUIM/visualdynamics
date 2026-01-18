/*
  Warnings:

  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `simulations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_email_validations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_password_resets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "simulations" DROP CONSTRAINT "simulations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_email_validations" DROP CONSTRAINT "user_email_validations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_password_resets" DROP CONSTRAINT "user_password_resets_user_id_fkey";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "simulations";

-- DropTable
DROP TABLE "user_email_validations";

-- DropTable
DROP TABLE "user_password_resets";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "status" "USER_STATUS" NOT NULL DEFAULT 'AWAITING_EMAIL_VALIDATION',
    "role" "USER_ROLE" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "id_token" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_password_reset" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usable" BOOLEAN NOT NULL DEFAULT true,
    "valid_until" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '15 min',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "molecule_name" TEXT NOT NULL,
    "ligand_itp_name" TEXT,
    "ligand_pdb_name" TEXT,
    "type" "SIMULATION_TYPE" NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "status" "SIMULATION_STATUS" NOT NULL DEFAULT 'QUEUED',
    "error_cause" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "simulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_user_name_key" ON "user"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_user_name_idx" ON "user"("user_name");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_first_name_idx" ON "user"("first_name");

-- CreateIndex
CREATE INDEX "user_last_name_idx" ON "user"("last_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_password_reset_id_key" ON "user_password_reset"("id");

-- CreateIndex
CREATE INDEX "simulation_user_id_idx" ON "simulation"("user_id");

-- CreateIndex
CREATE INDEX "simulation_molecule_name_idx" ON "simulation"("molecule_name");

-- CreateIndex
CREATE INDEX "simulation_ligand_itp_name_idx" ON "simulation"("ligand_itp_name");

-- CreateIndex
CREATE INDEX "simulation_ligand_pdb_name_idx" ON "simulation"("ligand_pdb_name");

-- CreateIndex
CREATE INDEX "simulation_type_idx" ON "simulation"("type");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_password_reset" ADD CONSTRAINT "user_password_reset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation" ADD CONSTRAINT "simulation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
