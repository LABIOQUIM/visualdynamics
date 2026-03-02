import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import * as ChildProcess from "child_process";
import * as dirTree from "directory-tree";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { join, resolve as pathResolve, sep as pathSep } from "path";
import { cwd } from "process";

import { Simulation, SIMULATION_TYPE } from "../generated/prisma/client";
import { SimulationUpdateInput } from "../generated/prisma/models";
import { PrismaService } from "../prisma.service";
import { readFileData } from "../utils/readFileData";
import { renderTemplate } from "../utils/renderTemplate";

import type { NewSimulationBody } from "./simulation.types";

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

@Injectable()
export class SimulationService {
  constructor(
    @InjectQueue("simulation") private simulationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async prepareSimulationEnvironment(
    id: string,
    fileName: string,
    fileNameLigandITP?: string,
    fileNameLigandPDB?: string,
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

    // Move ligand ITP to *run* folder
    if (fileNameLigandITP) {
      const [, fullFileNameLigandITP] = fileNameLigandITP.split("/");
      renameSync(
        `/files/${userName}/${fullFileNameLigandITP}`,
        `/files/${userName}/${id}/run/${fullFileNameLigandITP}`,
      );
    }

    // Move ligand PDB to *run* folder
    if (fileNameLigandPDB) {
      const [, fullFileNameLigandPDB] = fileNameLigandPDB.split("/");
      renameSync(
        `/files/${userName}/${fullFileNameLigandPDB}`,
        `/files/${userName}/${id}/run/${fullFileNameLigandPDB}`,
      );
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
    fileNameLigandITP: string,
    fileNameLigandITPOriginal: string,
    fileNameLigandPDB: string,
    fileNameLigandPDBOriginal: string,
    body: NewSimulationBody,
  ) {
    const [username, fullFileName] = fileName.split("/");
    const [origPDBName] = fileNameOriginal.split(".");
    const [origLigandITPName] = fileNameLigandITPOriginal.split(".");
    const [origLigandPDBName] = fileNameLigandPDBOriginal.split(".");

    validateSimulationParams(body);
    assertSafeFilename(fullFileName, "PDB file");
    const ligandITPBasename = fileNameLigandITP.includes("/")
      ? fileNameLigandITP.split("/")[1]
      : fileNameLigandITP;
    const ligandPDBBasename = fileNameLigandPDB.includes("/")
      ? fileNameLigandPDB.split("/")[1]
      : fileNameLigandPDB;
    assertSafeFilename(ligandITPBasename, "ligand ITP file");
    assertSafeFilename(ligandPDBBasename, "ligand PDB file");

    const pdbName = normalizeString(origPDBName);
    const ligandITPName = normalizeString(origLigandITPName);
    const ligandPDBName = normalizeString(origLigandPDBName);

    const { id } = await this.prisma.simulation.create({
      data: {
        moleculeName: pdbName,
        ligandITPName,
        ligandPDBName,
        status: "GENERATED",
        type: "acpype",
        user: {
          connect: {
            username,
          },
        },
      },
    });

    const acpypeMoleculeType = fileNameLigandITPOriginal
      .replace("_GMX", ".pdb.mol2")
      .replace(".itp", "");
    assertSafeFilename(acpypeMoleculeType, "acpype molecule type");

    const acpypeTemplatePath = join(
      cwd(),
      "static",
      "templates",
      "commands.acpype.txt",
    );
    let rendered: string;
    try {
      rendered = renderTemplate(readFileSync(acpypeTemplatePath, "utf-8"), {
        fullFileName,
        pdbName,
        forceField: body.forceField,
        waterModel: body.waterModel,
        boxDistance: body.boxDistance,
        boxType: body.boxType,
        ligandITPFile: ligandITPBasename,
        ligandPDBFile: ligandPDBBasename,
        acpypeMoleculeType,
      });
    } catch (err) {
      throw new Error(
        `Failed to load ACPYPE command template: ${err?.message}`,
      );
    }

    mkdirSync(`/files/${username}/${id}`, { recursive: true });
    writeFileSync(`/files/${username}/${id}/commands.txt`, rendered);

    await this.prepareSimulationEnvironment(
      id,
      fileName,
      fileNameLigandITP,
      fileNameLigandPDB,
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
      throw new Error(`Failed to load APO command template: ${err?.message}`);
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
        ligandITPName: true,
        ligandPDBName: true,
        startedAt: true,
        endedAt: true,
        status: true,
        type: true,
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

  async adminUpdateSimulation(id: string, body: SimulationUpdateInput) {
    const { id: _id, ...data } = body;

    await this.prisma.simulation.update({
      where: { id },
      data,
    });
  }

  async getUserLastSimulations(email: string) {
    let simulations: { [key: string]: Omit<Simulation, "updatedAt"> } = {};

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
          ligandITPName: true,
          ligandPDBName: true,
          moleculeName: true,
          startedAt: true,
          status: true,
          type: true,
          userId: true,
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

  async getSimulationFigures(userName: string, simulationId: string) {
    const userFolderPath = `/files/${userName}`;
    const runFolderPath = `/files/${userName}/${simulationId}/run`;
    const figuresFolderPath = `${userFolderPath}/${simulationId}/figures`;

    ChildProcess.execSync("cp *.xvg ../figures", {
      cwd: runFolderPath,
    });

    if (
      !existsSync(figuresFolderPath) ||
      readdirSync(figuresFolderPath).length <= 0
    ) {
      return "no-figures";
    }

    ChildProcess.execSync("cp *.xvg ../figures", {
      cwd: runFolderPath,
    });

    ChildProcess.execSync("zip -r figures.zip *", {
      cwd: figuresFolderPath,
    });

    return readFileSync(join(figuresFolderPath, "figures.zip"));
  }

  async getMDPFiles() {
    const runFolderPath = `${cwd()}/static/mdp`;

    ChildProcess.execSync("zip -r mdpfiles.zip *", {
      cwd: runFolderPath,
    });

    return readFileSync(join(runFolderPath, "mdpfiles.zip"));
  }

  async getSimulationCommands(userName: string, simulationId: string) {
    const userFolderPath = `/files/${userName}`;
    const commandsFilePath = `${userFolderPath}/${simulationId}/commands.txt`;

    if (!existsSync(commandsFilePath)) {
      return "no-commands";
    }

    return readFileSync(commandsFilePath);
  }

  async getSimulationGromacsLogs(userName: string, simulationId: string) {
    const userFolderPath = `/files/${userName}`;
    const logFilePath = `${userFolderPath}/${simulationId}/run/logs/gmx.log`;

    if (!existsSync(logFilePath)) {
      return "no-logs";
    }

    return readFileSync(logFilePath);
  }

  async getSimulationResults(userName: string, simulationId: string) {
    const userFolderPath = `/files/${userName}`;
    const runFolderPath = `${userFolderPath}/${simulationId}/run`;

    if (!existsSync(runFolderPath) || readdirSync(runFolderPath).length <= 0) {
      return "no-results";
    }

    ChildProcess.execSync(
      "zip -r results.zip *_PBC.xtc *_pr.tpr *_npt.gro *_PBC.gro *_pr.edr",
      {
        cwd: runFolderPath,
      },
    );

    return readFileSync(join(runFolderPath, "results.zip"));
  }

  async getUserFile(userPath: string) {
    const resolvedPath = pathResolve(userPath);
    const filesRoot = pathResolve("/files");

    if (!resolvedPath.startsWith(filesRoot + pathSep)) {
      throw new BadRequestException("Invalid file path");
    }

    if (!existsSync(resolvedPath)) {
      return "no-results";
    }

    return readFileSync(resolvedPath);
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
