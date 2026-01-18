-- CreateIndex
CREATE INDEX "simulations_user_id_idx" ON "simulations"("user_id");

-- CreateIndex
CREATE INDEX "simulations_molecule_name_idx" ON "simulations"("molecule_name");

-- CreateIndex
CREATE INDEX "simulations_ligand_itp_name_idx" ON "simulations"("ligand_itp_name");

-- CreateIndex
CREATE INDEX "simulations_ligand_pdb_name_idx" ON "simulations"("ligand_pdb_name");

-- CreateIndex
CREATE INDEX "simulations_type_idx" ON "simulations"("type");
