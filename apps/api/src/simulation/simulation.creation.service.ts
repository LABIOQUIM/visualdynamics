import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { cpSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";

import { SIMULATION_TYPE } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma.service.js";
import { normalizeString } from "../utils/normalizeString.js";
import { renderTemplate } from "../utils/renderTemplate.js";

import type { NewSimulationBody } from "./simulation.types.js";

const ALLOWED_FORCE_FIELDS = new Set([
  "amber03",
  "amber94",
  "amber96",
  "amber99",
  "amber99sb",
  "amber99sb-ildn",
  "amberGS",
  "ambergs",
  "charmm27",
  "gromos43a1",
  "gromos43a2",
  "gromos45a3",
  "gromos53a5",
  "gromos53a6",
  "gromos54a7",
  "oplsaa",
]);

const ALLOWED_WATER_MODELS = new Set([
  "tip3p",
  "tip4p",
  "tip4pew",
  "tip5p",
  "spc",
  "spce",
  "none",
]);

const ALLOWED_BOX_TYPES = new Set([
  "cubic",
  "dodecahedron",
  "octahedron",
  "triclinic",
]);

const BOX_DISTANCE_RE = /^\d+(\.\d+)?$/;
const SAFE_FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

function validateSimulationParams(
  body: Pick<
    NewSimulationBody,
    "forceField" | "waterModel" | "boxType" | "boxDistance"
  >,
): void {
  if (!ALLOWED_FORCE_FIELDS.has(body.forceField)) {
    throw new BadRequestException(
      `Unsupported force field: ${body.forceField}`,
    );
  }
  if (!ALLOWED_WATER_MODELS.has(body.waterModel)) {
    throw new BadRequestException(
      `Unsupported water model: ${body.waterModel}`,
    );
  }
  if (!ALLOWED_BOX_TYPES.has(body.boxType)) {
    throw new BadRequestException(`Unsupported box type: ${body.boxType}`);
  }
  if (!BOX_DISTANCE_RE.test(body.boxDistance)) {
    throw new BadRequestException(`Invalid box distance: ${body.boxDistance}`);
  }
}

function assertSafeFilename(value: string | undefined, field: string): void {
  if (!value || !SAFE_FILENAME_RE.test(value)) {
    throw new BadRequestException(`Unsafe characters in ${field}`);
  }
}

function splitPreservingNewlines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line, index, arr) => (index < arr.length - 1 ? line + "\n" : line));
}

function buildLigandComplexCommands(
  ligands: Array<{
    itpBasename: string;
    pdbBasename: string;
    acpypeMoleculeType: string;
  }>,
): string {
  const pdbFiles = ligands.map((l) => l.pdbBasename).join(" ");

  const atomtypesLines = ligands
    .map(
      (l, i) =>
        `awk '/^;?[ ]*\\[ *atomtypes/{in_at=1; print "[ atomtypes ]"; next} /^\\[/ && !/atomtypes/{in_at=0} in_at{print}' ${l.itpBasename} ${i === 0 ? ">" : ">>"} ligand_atomtypes.txt`,
    )
    .join("\n");

  const deduplicateAtomtypes =
    "awk '/^\\[ *atomtypes/{if(!dir++) print; next}" +
    " /^;/{if(!cmt[$0]++) print; next}" +
    " NF && !seen[$1]++{print}'" +
    " ligand_atomtypes.txt > ligand_atomtypes_dedup.txt" +
    " && mv ligand_atomtypes_dedup.txt ligand_atomtypes.txt";

  const molTypeCounts = new Map<string, number>();
  const uniqueByMolType = new Map<
    string,
    { itpBasename: string; pdbBasename: string; acpypeMoleculeType: string }
  >();
  for (const l of ligands) {
    molTypeCounts.set(
      l.acpypeMoleculeType,
      (molTypeCounts.get(l.acpypeMoleculeType) ?? 0) + 1,
    );
    if (!uniqueByMolType.has(l.acpypeMoleculeType)) {
      uniqueByMolType.set(l.acpypeMoleculeType, l);
    }
  }
  const uniqueLigands = [...uniqueByMolType.values()];

  const strippedBasenames = uniqueLigands.map((l) =>
    l.itpBasename.replace(/\.itp$/i, "_noat.itp"),
  );
  const stripLines = uniqueLigands
    .map(
      (l, i) =>
        `awk '/^;?[ ]*\\[ *atomtypes/{in_at=1} /^\\[/ && !/atomtypes/{in_at=0} !in_at{print}' ${l.itpBasename} > ${strippedBasenames[i]}`,
    )
    .join("\n");

  const includeExprs = strippedBasenames
    .map((b) => `-e '/forcefield.itp"/a\\#include "${b}"'`)
    .join(" ");

  const topologyLine = `cat {{pdbName}}_livre.top | sed ${includeExprs} | sed '/forcefield.itp/r ligand_atomtypes.txt' > {{pdbName}}_complx.top`;

  const moleculeTypeLines = [...molTypeCounts.entries()]
    .map(
      ([molType, count]) =>
        `echo "${molType}         ${count}" >> {{pdbName}}_complx.top`,
    )
    .join("\n");

  return [
    `grep -h ATOM {{pdbName}}_livre.pdb ${pdbFiles} | tee {{pdbName}}_complx.pdb > /dev/null`,
    atomtypesLines,
    deduplicateAtomtypes,
    stripLines,
    topologyLine,
    moleculeTypeLines,
  ].join("\n");
}

@Injectable()
export class SimulationCreationService {
  constructor(
    @InjectQueue("simulation") private simulationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async prepareSimulationEnvironment(
    id: string,
    fileName: string,
    ligandFiles?: Array<{ itp: string; pdb: string }>,
  ) {
    const [userName, fullFileName] = fileName.split("/");

    mkdirSync(`/files/${userName}/${id}/run/logs`, {
      recursive: true,
    });
    mkdirSync(`/files/${userName}/${id}/figures`);

    renameSync(
      `/files/${userName}/${fullFileName}`,
      `/files/${userName}/${id}/run/${fullFileName}`,
    );

    if (ligandFiles) {
      for (const { itp, pdb } of ligandFiles) {
        const itpBasename = itp.split("/").pop()!;
        const pdbBasename = pdb.split("/").pop()!;
        renameSync(
          `/files/${userName}/${itpBasename}`,
          `/files/${userName}/${id}/run/${itpBasename}`,
        );
        renameSync(
          `/files/${userName}/${pdbBasename}`,
          `/files/${userName}/${id}/run/${pdbBasename}`,
        );
      }

      for (let i = 0; i < ligandFiles.length; i++) {
        const pdbBasename = ligandFiles[i].pdb.split("/").pop()!;
        const pdbExt = pdbBasename.split(".").pop()!;
        cpSync(
          `/files/${userName}/${id}/run/${pdbBasename}`,
          `/files/${userName}/${id}/run/originalLigand_${i}.${pdbExt}`,
        );
      }
    }

    cpSync(`${cwd()}/static/mdp`, `/files/${userName}/${id}/run`, {
      recursive: true,
    });
  }

  async addSimulationToQueue(
    simulationId: string,
    username: string,
    type: SIMULATION_TYPE,
    successEmail: string,
    errorEmail: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    await this.prisma.simulation.update({
      where: {
        id: simulationId,
      },
      data: {
        status: "QUEUED",
      },
    });
    await this.simulationQueue.add("simulation", {
      simulationId,
      user,
      type,
      successEmail,
      errorEmail,
    }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
  }

  async newACPYPESimulation(
    fileName: string,
    fileNameOriginal: string,
    ligandFiles: Array<{
      fileNameITP: string;
      fileNameITPOriginal: string;
      fileNamePDB: string;
      fileNamePDBOriginal: string;
    }>,
    body: NewSimulationBody,
  ) {
    const [username, fullFileName] = fileName.split("/");
    const [origPDBName] = fileNameOriginal.split(".");

    validateSimulationParams(body);
    assertSafeFilename(fullFileName, "PDB file");

    const pdbName = normalizeString(origPDBName);

    // Validate and normalize each ligand
    const processedLigands = ligandFiles.map((lf, index) => {
      const itpBasename = lf.fileNameITP.includes("/")
        ? lf.fileNameITP.split("/")[1]
        : lf.fileNameITP;
      const pdbBasename = lf.fileNamePDB.includes("/")
        ? lf.fileNamePDB.split("/")[1]
        : lf.fileNamePDB;

      assertSafeFilename(itpBasename, `ligand ITP file [${index}]`);
      assertSafeFilename(pdbBasename, `ligand PDB file [${index}]`);

      const [origLigandITPName] = lf.fileNameITPOriginal.split(".");
      const [origLigandPDBName] = lf.fileNamePDBOriginal.split(".");

      const ligandITPName = normalizeString(origLigandITPName);
      const ligandPDBName = normalizeString(origLigandPDBName);

      const acpypeMoleculeType = lf.fileNameITPOriginal
        .replace("_GMX", ".pdb.mol2")
        .replace(".itp", "");
      assertSafeFilename(acpypeMoleculeType, `acpype molecule type [${index}]`);

      return {
        itpBasename,
        pdbBasename,
        ligandITPName,
        ligandPDBName,
        acpypeMoleculeType,
        filePathITP: lf.fileNameITP,
        filePathPDB: lf.fileNamePDB,
      };
    });

    const { id } = await this.prisma.simulation.create({
      data: {
        moleculeName: pdbName,
        status: "GENERATED",
        type: "acpype",
        user: {
          connect: { username },
        },
        ligands: {
          create: processedLigands.map((l, i) => ({
            ligandITPName: l.ligandITPName,
            ligandPDBName: l.ligandPDBName,
            position: i,
          })),
        },
      },
    });

    // Build the multi-ligand block for the template
    const ligandComplexCommands = buildLigandComplexCommands(processedLigands);

    const acpypeTemplatePath = join(
      cwd(),
      "static",
      "templates",
      "commands.acpype.txt",
    );
    let rendered: string;
    try {
      rendered = renderTemplate(readFileSync(acpypeTemplatePath, "utf-8"), {
        ligandComplexCommands,
        fullFileName,
        pdbName,
        forceField: body.forceField,
        waterModel: body.waterModel,
        boxDistance: body.boxDistance,
        boxType: body.boxType,
      });
    } catch (err) {
      throw new Error(
        `Failed to load ACPYPE command template: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    mkdirSync(`/files/${username}/${id}`, { recursive: true });
    writeFileSync(`/files/${username}/${id}/commands.txt`, rendered);

    await this.prepareSimulationEnvironment(
      id,
      fileName,
      processedLigands.map((l) => ({ itp: l.filePathITP, pdb: l.filePathPDB })),
    );

    return {
      simulationId: id,
      commands: splitPreservingNewlines(rendered),
    };
  }

  async newAPOSimulation(
    fileName: string,
    fileNameOriginal: string,
    body: NewSimulationBody,
  ) {
    const [username, fullFileName] = fileName.split("/");
    const [origPDBName] = fileNameOriginal.split(".");

    validateSimulationParams(body);
    assertSafeFilename(fullFileName, "PDB file");

    const pdbName = normalizeString(origPDBName);

    const { id } = await this.prisma.simulation.create({
      data: {
        moleculeName: pdbName,
        status: "GENERATED",
        type: "apo",
        user: {
          connect: {
            username,
          },
        },
      },
    });

    const apoTemplatePath = join(
      cwd(),
      "static",
      "templates",
      "commands.apo.txt",
    );
    let rendered: string;
    try {
      rendered = renderTemplate(readFileSync(apoTemplatePath, "utf-8"), {
        fullFileName,
        pdbName,
        forceField: body.forceField,
        waterModel: body.waterModel,
        boxDistance: body.boxDistance,
        boxType: body.boxType,
      });
    } catch (err) {
      throw new Error(
        `Failed to load APO command template: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    mkdirSync(`/files/${username}/${id}`, { recursive: true });
    writeFileSync(`/files/${username}/${id}/commands.txt`, rendered);

    await this.prepareSimulationEnvironment(id, fileName);

    return {
      simulationId: id,
      commands: splitPreservingNewlines(rendered),
    };
  }
}
