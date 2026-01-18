/*
  Warnings:

  - The values [ACPYPE,APO,PRODRG] on the enum `SIMULATION_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SIMULATION_TYPE_new" AS ENUM ('acpype', 'apo');
ALTER TABLE "simulations" ALTER COLUMN "type" TYPE "SIMULATION_TYPE_new" USING ("type"::text::"SIMULATION_TYPE_new");
ALTER TYPE "SIMULATION_TYPE" RENAME TO "SIMULATION_TYPE_old";
ALTER TYPE "SIMULATION_TYPE_new" RENAME TO "SIMULATION_TYPE";
DROP TYPE "SIMULATION_TYPE_old";
COMMIT;
