import { InjectQueue } from "@nestjs/bullmq";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Queue } from "bullmq";
import * as ChildProcess from "child_process";
import dirTree from "directory-tree";
import type { ReadStream } from "fs";
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { cwd } from "process";
import { promisify } from "util";

import { SIMULATION_TYPE } from "../generated/prisma/client";
import { SimulationUpdateInput } from "../generated/prisma/models";
import { PrismaService } from "../prisma.service";
import { readFileData } from "../utils/readFileData";
import { renderTemplate } from "../utils/renderTemplate";

import type { NewSimulationBody } from "./simulation.types";

const execAsync = promisify(ChildProcess.exec);

import { normalizeString } from "@/src/utils/normalizeString";

// Allowlists for GROMACS parameters used in shell command templates.
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

/** Matches a positive decimal number, e.g. "1.0", "1.2", "0.5" */
const BOX_DISTANCE_RE = /^\d+(\.\d+)?$/;

/** Matches safe filenames: alphanumeric, dots, underscores, hyphens only */
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

/** Splits rendered template text into lines while preserving trailing newlines. */
function splitPreservingNewlines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line, index, arr) => (index < arr.length - 1 ? line + "\n" : line));
}

/**
 * Generates the shell commands block for the #break section of the ACPYPE
 * template when there are N ligands. Using `{{pdbName}}` as a pass-through
 * placeholder so renderTemplate can resolve it afterwards.
 */
function buildLigandComplexCommands(
  ligands: Array<{
    itpBasename: string;
    pdbBasename: string;
    acpypeMoleculeType: string;
  }>,
): string {
  const pdbFiles = ligands.map((l) => l.pdbBasename).join(" ");

  // Build atomtypes.txt: first ligand creates, rest append.
  // Extract only the [ atomtypes ] block from each ITP.
  const atomtypesLines = ligands
    .map(
      (l, i) =>
        `awk '/^\\[ *atomtypes/{in_at=1} /^\\[/ && !/atomtypes/{in_at=0} in_at{print}' ${l.itpBasename} ${i === 0 ? ">" : ">>"} ligand_atomtypes.txt`,
    )
    .join("\n");

  // Deduplicate after all appends: keep one [ atomtypes ] directive, one copy
  // of each comment line, and the first definition of each atom type name.
  // This prevents GROMACS from rejecting "defined twice" atom type errors when
  // multiple ligands share GAFF/GAFF2 atom types.
  const deduplicateAtomtypes =
    "awk '/^\\[ *atomtypes/{if(!dir++) print; next}" +
    " /^;/{if(!cmt[$0]++) print; next}" +
    " NF && !seen[$1]++{print}'" +
    " ligand_atomtypes.txt > ligand_atomtypes_dedup.txt" +
    " && mv ligand_atomtypes_dedup.txt ligand_atomtypes.txt";

  // Create stripped copies of each ITP without their [ atomtypes ] block.
  // GROMACS requires [ atomtypes ] to appear before any [ moleculetype ].
  // When multiple ligands are included, the second ITP's [ atomtypes ] would
  // come after the first ITP's [ moleculetype ], causing an "Invalid order"
  // error. The consolidated atomtypes are already injected via
  // ligand_atomtypes.txt right after the forcefield include.
  //
  // Additionally, GROMACS rejects a moleculetype that is defined more than
  // once. When two input ligands share the same moleculetype name (e.g. two
  // copies of the same ligand), the ITP is only included once in the topology
  // and the count in the [ molecules ] section is incremented accordingly.
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
        `awk '/^\\[ *atomtypes/{in_at=1} /^\\[/ && !/atomtypes/{in_at=0} !in_at{print}' ${l.itpBasename} > ${strippedBasenames[i]}`,
    )
    .join("\n");

  // Build the piped sed commands to include each stripped ITP in the topology.
  const includeExprs = strippedBasenames
    .map((b) => `-e '/forcefield.itp"/a\\#include "${b}"'`)
    .join(" ");

  const topologyLine = `cat {{pdbName}}_livre.top | sed ${includeExprs} | sed '/forcefield.itp/r ligand_atomtypes.txt' > {{pdbName}}_complx.top`;

  // Add molecule type entries — use the count so duplicate ligands appear as
  // e.g. "Pol647.pdb.mol2   2" instead of two separate lines.
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
export class SimulationService {
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

    // Make *run* and *figures* directories
    mkdirSync(`/files/${userName}/${id}/run/logs`, {
      recursive: true,
    });
    mkdirSync(`/files/${userName}/${id}/figures`);

    // Move main molecule to *run* folder
    renameSync(
      `/files/${userName}/${fullFileName}`,
      `/files/${userName}/${id}/run/${fullFileName}`,
    );

    // Move each ligand file pair to *run* folder
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

      // Copy the first ligand PDB as the canonical viewer file
      if (ligandFiles.length > 0) {
        const firstPDBBasename = ligandFiles[0].pdb.split("/").pop()!;
        const firstPDBExt = firstPDBBasename.split(".").pop()!;
        cpSync(
          `/files/${userName}/${id}/run/${firstPDBBasename}`,
          `/files/${userName}/${id}/run/originalLigand.${firstPDBExt}`,
        );
      }
    }

    // Copy all MDP files needed to run a simulation into folder
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

  async getSimulationDetails(username: string, simulationId: string) {
    const userFolderPath = `/files/${username}`;
    const jobs = await this.simulationQueue.getJobs();
    const waitingJobs = await this.simulationQueue.getJobs(["waiting"]);
    const activeJobs = await this.simulationQueue.getJobs(["active"]);

    // Get Job ID
    let jobId = "-1";

    const jobIndex = jobs.findIndex(
      (job) => job.data.simulationId === simulationId,
    );

    if (jobIndex !== -1) {
      jobId = jobs[jobIndex].id;
    }

    // Get Job Queue Position
    let queuePosition = -1;

    const waitingJobIndex = waitingJobs.findIndex(
      (job) => job.data.simulationId === simulationId,
    );

    if (waitingJobIndex !== -1) {
      queuePosition = waitingJobs.length - waitingJobIndex;
    }

    // Get Job Status
    let isActive = false;

    const activeJobIndex = activeJobs.findIndex(
      (job) => job.data.simulationId === simulationId,
    );

    if (activeJobIndex !== -1) {
      isActive = true;
    }

    const simulationFolderPath = `${userFolderPath}/${simulationId}`;
    const logFilePath = `${simulationFolderPath}/run/logs/gmx.log`;
    const molFilePath = `${simulationFolderPath}/run/originalMacromolecule.pdb`;
    const ligFilePath = `${simulationFolderPath}/run/originalLigand.pdb`;
    const stepFilePath = `${simulationFolderPath}/steps.txt`;

    let isStored = false;

    if (existsSync(simulationFolderPath)) {
      isStored = true;
    }

    let stepData: string[] = [];
    let logData: string[] = [];

    if (existsSync(stepFilePath)) {
      stepData = readFileData(stepFilePath, false);
    }

    if (existsSync(logFilePath)) {
      logData = readFileData(logFilePath, true);
    }

    let molecules = {
      macromolecule: null,
      ligand: null,
    };

    if (existsSync(molFilePath)) {
      molecules.macromolecule = readFileData(molFilePath, false).join("\n");
    }

    if (existsSync(ligFilePath)) {
      molecules.ligand = readFileData(ligFilePath, false).join("\n");
    }

    const simulation = await this.prisma.simulation.findFirst({
      where: {
        id: simulationId,
      },
      select: {
        errorCause: true,
        createdAt: true,
        moleculeName: true,
        startedAt: true,
        endedAt: true,
        status: true,
        type: true,
        ligands: {
          select: {
            ligandITPName: true,
            ligandPDBName: true,
            position: true,
          },
          orderBy: { position: "asc" },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      isActive,
      isStored,
      queuePosition,
      jobId,
      stepData,
      logData,
      simulation,
      molecules,
    };
  }

  async getUserSimulations(id: string, pageSize: number, page: number) {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.simulation.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: page * pageSize,
        take: pageSize,
      }),
      this.prisma.simulation.count({
        where: {
          userId: id,
        },
      }),
    ]);

    return { records, total };
  }

  async getMgmtSimulations(id: string, pageSize: number, page: number) {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.simulation.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
        skip: page * pageSize,
        take: pageSize,
      }),
      this.prisma.simulation.count(),
    ]);

    return { records, total };
  }

  async cancelSimulation(
    simulationId: string,
    requestUserId: string,
    isAdmin: boolean,
  ) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: { user: true },
    });

    if (!simulation) {
      throw new NotFoundException("Simulation not found");
    }

    if (!isAdmin && simulation.userId !== requestUserId) {
      throw new UnauthorizedException("Unauthorized");
    }

    if (simulation.status !== "QUEUED" && simulation.status !== "RUNNING") {
      throw new ConflictException(
        `Simulation cannot be canceled in status "${simulation.status}"`,
      );
    }

    // If the job is running, kill the sandboxed processor process.
    if (simulation.status === "RUNNING") {
      const pidFilePath = `/files/${simulation.user.username}/${simulationId}/processing.pid`;
      if (existsSync(pidFilePath)) {
        try {
          const raw = readFileSync(pidFilePath, "utf-8").trim();
          const colonIdx = raw.indexOf(":");
          const pidStr = colonIdx >= 0 ? raw.slice(0, colonIdx) : raw;
          const pid = parseInt(pidStr, 10);
          if (Number.isSafeInteger(pid) && pid > 0) {
            // Try to signal the process group; fall back to single-PID kill.
            const pgidRaw = readFileSync(`/proc/${pid}/stat`, "utf-8");
            const afterComm = pgidRaw.slice(pgidRaw.lastIndexOf(")") + 2);
            const pgid = parseInt(afterComm.split(" ")[2], 10);
            const ownStat = readFileSync(`/proc/${process.pid}/stat`, "utf-8");
            const ownAfterComm = ownStat.slice(ownStat.lastIndexOf(")") + 2);
            const ownPgid = parseInt(ownAfterComm.split(" ")[2], 10);
            if (Number.isSafeInteger(pgid) && pgid > 0 && pgid !== ownPgid) {
              try {
                process.kill(-pgid, "SIGTERM");
              } catch {
                process.kill(pid, "SIGTERM");
              }
            } else {
              process.kill(pid, "SIGTERM");
            }
          }
        } catch {
          // PID file unreadable or process already gone — proceed to DB update.
        }
      }
    }

    // Remove the job from the BullMQ queue (no-op if it was already processed).
    const jobs = await this.simulationQueue.getJobs([
      "waiting",
      "active",
      "delayed",
    ]);
    const job = jobs.find((j) => j.data.simulationId === simulationId);
    if (job) {
      await job.remove();
    }

    await this.prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "CANCELED", endedAt: new Date() },
    });

    return { status: "canceled" };
  }

  async adminUpdateSimulation(id: string, body: SimulationUpdateInput) {
    const { id: _id, ...data } = body;

    await this.prisma.simulation.update({
      where: { id },
      data,
    });
  }

  async getUserLastSimulations(email: string) {
    let simulations: Record<string, unknown> = {};

    for (const type of ["acpype", "apo"] satisfies SIMULATION_TYPE[]) {
      const data = await this.prisma.simulation.findFirst({
        where: {
          user: {
            email,
          },
          type,
        },
        select: {
          createdAt: true,
          endedAt: true,
          errorCause: true,
          id: true,
          moleculeName: true,
          startedAt: true,
          status: true,
          type: true,
          userId: true,
          ligands: {
            select: {
              ligandITPName: true,
              ligandPDBName: true,
              position: true,
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      simulations = {
        ...simulations,
        [type]: data,
      };
    }

    return simulations;
  }

  async getSimulationFigures(
    userName: string,
    simulationId: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-figures"> {
    const userFolderPath = `/files/${userName}`;
    const runFolderPath = `/files/${userName}/${simulationId}/run`;
    const figuresFolderPath = `${userFolderPath}/${simulationId}/figures`;

    await execAsync("cp *.xvg ../figures", { cwd: runFolderPath });

    if (
      !existsSync(figuresFolderPath) ||
      readdirSync(figuresFolderPath).length <= 0
    ) {
      return "no-figures";
    }

    await execAsync("zip -r figures.zip *", { cwd: figuresFolderPath });

    const zipPath = join(figuresFolderPath, "figures.zip");
    return { stream: createReadStream(zipPath), size: statSync(zipPath).size };
  }

  async getMDPFiles(): Promise<{ stream: ReadStream; size: number }> {
    const runFolderPath = `${cwd()}/static/mdp`;

    await execAsync("zip -r mdpfiles.zip *", { cwd: runFolderPath });

    const zipPath = join(runFolderPath, "mdpfiles.zip");
    return { stream: createReadStream(zipPath), size: statSync(zipPath).size };
  }

  async getSimulationCommands(
    userName: string,
    simulationId: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-commands"> {
    const userFolderPath = `/files/${userName}`;
    const commandsFilePath = `${userFolderPath}/${simulationId}/commands.txt`;

    if (!existsSync(commandsFilePath)) {
      return "no-commands";
    }

    return {
      stream: createReadStream(commandsFilePath),
      size: statSync(commandsFilePath).size,
    };
  }

  async getSimulationGromacsLogs(
    userName: string,
    simulationId: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-logs"> {
    const userFolderPath = `/files/${userName}`;
    const logFilePath = `${userFolderPath}/${simulationId}/run/logs/gmx.log`;

    if (!existsSync(logFilePath)) {
      return "no-logs";
    }

    return {
      stream: createReadStream(logFilePath),
      size: statSync(logFilePath).size,
    };
  }

  async getSimulationResults(
    userName: string,
    simulationId: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-results"> {
    const userFolderPath = `/files/${userName}`;
    const runFolderPath = `${userFolderPath}/${simulationId}/run`;

    if (!existsSync(runFolderPath) || readdirSync(runFolderPath).length <= 0) {
      return "no-results";
    }

    await execAsync(
      "zip -r results.zip *_PBC.xtc *_pr.tpr *_npt.gro *_PBC.gro *_pr.edr",
      { cwd: runFolderPath },
    );

    const zipPath = join(runFolderPath, "results.zip");
    return { stream: createReadStream(zipPath), size: statSync(zipPath).size };
  }

  async getUserFile(
    path: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-results"> {
    if (!existsSync(path)) {
      return "no-results";
    }

    return { stream: createReadStream(path), size: statSync(path).size };
  }

  async getUserLastSimulationFiles(userName: string) {
    const userFolder = `/files/${userName}`;

    const tree = dirTree(userFolder);

    return tree;
  }

  async getLastMacromoleculeFiles(userName: string, id: string) {
    const userFolder = `/files/${userName}`;
    const runFolder = `${userFolder}/${id}/run`;

    const macromoleculeFile = `${runFolder}/originalMacromolecule.pdb`;
    const ligandItpFile = `${runFolder}/originalLigand.itp`;
    const ligandPdbFile = `${runFolder}/originalLigand.pdb`;

    if (!existsSync(macromoleculeFile)) {
      return "no-macromolecule";
    }

    if (!existsSync(ligandItpFile) || !existsSync(ligandPdbFile)) {
      return {
        macromolecule: readFileSync(macromoleculeFile).toString(),
      };
    }

    return {
      macromolecule: readFileSync(macromoleculeFile).toString(),
      ligandItp: readFileSync(ligandItpFile).toString(),
      ligandPdb: readFileSync(ligandPdbFile).toString(),
    };
  }

  async getQueueInfo() {
    const active = await this.simulationQueue.getActiveCount();
    const failed = await this.simulationQueue.getFailedCount();
    // const paused = await this.simulationQueue.getPausedCount();
    const paused = 0;
    const delayed = await this.simulationQueue.getDelayedCount();
    const waiting = await this.simulationQueue.getWaitingCount();
    const completed = await this.simulationQueue.getCompletedCount();

    const jobs = await this.simulationQueue.getJobs([
      "active",
      "completed",
      "delayed",
      "failed",
      "paused",
      "waiting",
    ]);

    return { active, failed, paused, delayed, waiting, completed, jobs };
  }
}
