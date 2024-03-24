-- CreateEnum
CREATE TYPE "SimulationType" AS ENUM ('ACPYPE', 'APO', 'PRODRG');

-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'CANCELED', 'ERRORED', 'GENERATED');

-- CreateTable
CREATE TABLE "simulations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "molecule_name" TEXT NOT NULL,
    "type" "SimulationType" NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "status" "SimulationStatus" NOT NULL DEFAULT 'QUEUED',
    "errored_on_command" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
