/*
  Warnings:

  - You are about to drop the column `errored_on_command` on the `simulations` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `simulations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "simulations" DROP COLUMN "errored_on_command",
ADD COLUMN     "error_cause" TEXT,
ADD COLUMN     "ligand_itp_name" TEXT,
ADD COLUMN     "ligand_pdb_name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
