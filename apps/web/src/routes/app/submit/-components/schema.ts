import { z } from "zod";

export const simulationSchema = z
  .object({
    type: z.enum(["apo", "acpype"] as const, {
      required_error: "Simulation type is required",
    }),
    filePDB: z
      .instanceof(File, { message: "PDB file is required" })
      .refine(
        async (file) => {
          const text = await file.text();
          return text.includes("ATOM") || text.includes("HETATM");
        },
        { message: "Invalid PDB file" },
      ),
    fileLigandPDB: z.preprocess(
      (val) => (val === null ? undefined : val),
      z.instanceof(File).optional(),
    ),
    fileLigandITP: z.preprocess(
      (val) => (val === null ? undefined : val),
      z.instanceof(File).optional(),
    ),
    forceField: z.string().min(1, "Force field is required"),
    waterModel: z.string().min(1, "Water model is required"),
    boxType: z.string().min(1, "Box type is required"),
    boxDistance: z
      .number({
        required_error: "Box distance is required",
        invalid_type_error: "Box distance is required",
      })
      .min(0.1, "Minimum is 0.1 nm")
      .max(1.2, "Maximum is 1.2 nm"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "acpype") {
      if (!data.fileLigandPDB) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ligand PDB file is required",
          path: ["fileLigandPDB"],
        });
      }
      if (!data.fileLigandITP) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ligand ITP file is required",
          path: ["fileLigandITP"],
        });
      }
    }
  });

export type SimulationFormValues = z.infer<typeof simulationSchema>;
