-- CreateTable: simulation_ligand
CREATE TABLE "simulation_ligand" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "ligand_itp_name" TEXT NOT NULL,
    "ligand_pdb_name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_ligand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulation_ligand_simulation_id_idx" ON "simulation_ligand"("simulation_id");

-- AddForeignKey
ALTER TABLE "simulation_ligand" ADD CONSTRAINT "simulation_ligand_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MigrateData: copy existing flat ligand fields into the new table
INSERT INTO "simulation_ligand" ("id", "simulation_id", "ligand_itp_name", "ligand_pdb_name", "position", "created_at")
SELECT
    gen_random_uuid()::text,
    "id",
    "ligand_itp_name",
    "ligand_pdb_name",
    0,
    "created_at"
FROM "simulation"
WHERE "ligand_itp_name" IS NOT NULL
  AND "ligand_pdb_name" IS NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "simulation_ligand_itp_name_idx";
DROP INDEX IF EXISTS "simulation_ligand_pdb_name_idx";

-- DropColumn
ALTER TABLE "simulation" DROP COLUMN IF EXISTS "ligand_itp_name";
ALTER TABLE "simulation" DROP COLUMN IF EXISTS "ligand_pdb_name";
