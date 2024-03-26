/*
  Warnings:

  - The `status` column on the `simulations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `simulations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SIMULATION_TYPE" AS ENUM ('ACPYPE', 'APO', 'PRODRG');

-- CreateEnum
CREATE TYPE "SIMULATION_STATUS" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'CANCELED', 'ERRORED', 'GENERATED');

-- AlterTable
ALTER TABLE "simulations" DROP COLUMN "type",
ADD COLUMN     "type" "SIMULATION_TYPE" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SIMULATION_STATUS" NOT NULL DEFAULT 'QUEUED';

-- DropEnum
DROP TYPE "SimulationStatus";

-- DropEnum
DROP TYPE "SimulationType";
