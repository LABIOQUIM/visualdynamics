import { z } from "zod";

const ligandPairSchema = z.object({
  filePDB: z.instanceof(File, { message: "Ligand PDB file is required" }),
  fileITP: z.instanceof(File, { message: "Ligand ITP file is required" }),
});

export const simulationSchema = z
  .object({
    type: z.enum(["apo", "acpype"] as const),
    filePDB: z.instanceof(File, { message: "PDB file is required" }).refine(
      async (file) => {
        const text = await file.text();
        return text.includes("ATOM") || text.includes("HETATM");
      },
      { message: "Invalid PDB file" },
    ),
    ligands: z.array(ligandPairSchema).optional(),
    forceField: z.string().min(1, "Force field is required"),
    waterModel: z.string().min(1, "Water model is required"),
    boxType: z.string().min(1, "Box type is required"),
    boxDistance: z
      .number({ error: "Box distance is required" })
      .min(0.1, "Minimum is 0.1 nm")
      .max(1.2, "Maximum is 1.2 nm"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "acpype") {
      if (!data.ligands || data.ligands.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one ligand is required",
          path: ["ligands"],
        });
      }
    }
  });

export type SimulationFormValues = z.infer<typeof simulationSchema>;
