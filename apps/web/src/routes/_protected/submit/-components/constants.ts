export const boxTypes = {
  cubic: "Cubic",
  triclinic: "Triclinic",
  dodecahedron: "Dodecahedron",
  octahedron: "Octahedron",
} as const;

export const waterModels = {
  spc: "SPC simple point charge",
  spce: "SPC/E extended simple point charge",
  none: "None",
  tip3p: "TIP3P (AMBER e OPLS apenas)",
  tip4p: "TIP4P (AMBER e OPLS apenas)",
  tip5p: "TIP5P (AMBER e OPLS apenas)",
} as const;

export const allForceFields = {
  apo: {
    amber03: "AMBER03 protein, nucleic AMBER94",
    amber94: "AMBER94 force field",
    amber96: "AMBER96 protein, nucleic AMBER94",
    amber99: "AMBER99 protein, nucleic AMBER94",
    amber99sb: "AMBER99SB protein, nucleic AMBER94",
    "amber99sb-ildn": "AMBER99SB-ILDN protein, nucleic AMBER94",
    ambergs: "AMBERGS force field",
    charmm27: "CHARMM27 all-atom force field",
    gromos43a1: "GROMOS96 43a1 force field",
    gromos43a2: "GROMOS96 43a2 force field",
    gromos45a3: "GROMOS96 45a3 force field",
    gromos53a5: "GROMOS96 53a5 force field",
    gromos53a6: "GROMOS96 53a6 force field",
    gromos54a7: "GROMOS96 54a7 force field",
    oplsaa: "OPLS-AA/L all-atom force",
  },
  acpype: {
    amber03: "AMBER03 protein, nucleic AMBER94",
    amber94: "AMBER94 force field",
    amber96: "AMBER96 protein, nucleic AMBER94",
    amber99: "AMBER99 protein, nucleic AMBER94",
    amber99sb: "AMBER99SB protein, nucleic AMBER94",
    "amber99sb-ildn": "AMBER99SB-ILDN protein, nucleic AMBER94",
    ambergs: "AMBERGS force field",
  },
} as const;

export const simulationTypes = {
  apo: "Free Protein",
  acpype: "Protein with Ligand (ACPYPE)",
};
