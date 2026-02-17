import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import * as ChildProcess from "child_process";
import * as dirTree from "directory-tree";
import {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { cwd } from "process";

import { Simulation, SIMULATION_TYPE } from "../generated/prisma/client";
import { PrismaService } from "../prisma.service";

import type { NewSimulationBody } from "./simulation.types";

import { normalizeString } from "@/src/utils/normalizeString";

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
    writeFileSync(`/files/${username}/queued`, type);
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

    const commands = [
      "#topology\n",
      `grep 'ATOM  ' ${fullFileName} > Protein.pdb\n`,
      `gmx pdb2gmx -f Protein.pdb -o ${pdbName}_livre.pdb -p ${pdbName}_livre.top -ff ${body.forceField} -water ${body.waterModel} -ignh -missing\n\n`,
      "#break\n",
      `grep -h ATOM ${pdbName}_livre.pdb ${
        fileNameLigandPDB.split("/")[1]
      } | tee ${pdbName}_complx.pdb > /dev/null\n`,
      `cat ${
        fileNameLigandITP.split("/")[1]
      } | sed -n '/atomtypes/,/^ *$/{{/\\n\\n/d;p}}' > ligand_atomtypes.txt\n`,
      `cat ${pdbName}_livre.top | sed '/forcefield.itp"/a#include "${
        fileNameLigandITP.split("/")[1]
      }"' > ${pdbName}1_complx.top\n`,
      `cat ${pdbName}1_complx.top | sed '/forcefield.itp/r ligand_atomtypes.txt' > ${pdbName}_complx.top\n`,
      `echo "${acpypeMoleculeType}         1" >> ${pdbName}_complx.top\n\n`,
      `gmx editconf -f ${pdbName}_complx.pdb -c -d ${body.boxDistance} -bt ${body.boxType} -o ${pdbName}_complx.pdb\n\n`,
      "#solvate\n",
      `gmx solvate -cp ${pdbName}_complx.pdb -cs spc216.gro -p ${pdbName}_complx.top -o ${pdbName}_complx_box.pdb\n\n`,
      "#ions\n",
      `gmx grompp -f ions.mdp -c ${pdbName}_complx_box.pdb -p ${pdbName}_complx.top -o ${pdbName}_complx_charged.tpr -maxwarn 20\n`,
      `echo "SOL" | gmx genion -s ${pdbName}_complx_charged.tpr -p ${pdbName}_complx.top -o ${pdbName}_complx_neutral.pdb -neutral\n\n`,
      "#minimizationsteepdesc\n",
      `gmx grompp -f PME_em.mdp -c ${pdbName}_complx_neutral.pdb -p ${pdbName}_complx.top -o ${pdbName}_complx_em.tpr -maxwarn 20\n`,
      `gmx mdrun -v -s ${pdbName}_complx_em.tpr -deffnm ${pdbName}_complx_sd_em\n`,
      `echo "10 0" | gmx energy -f ${pdbName}_complx_sd_em.edr -o ${pdbName}_complx_potentialsd.xvg\n`,
      `grace -nxy ${pdbName}_complx_potentialsd.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_potentialsd.png\n\n`,
      // "#minimizationconjgrad\n",
      // `gmx grompp -f PME_cg_em.mdp -c ${pdbName}_complx_sd_em.gro -p ${pdbName}_complx.top -o ${pdbName}_complx_cg_em.tpr -maxwarn 20\n`,
      // `gmx mdrun -v -s ${pdbName}_complx_cg_em.tpr -deffnm ${pdbName}_complx_cg_em\n`,
      // `echo "10 0" | gmx energy -f ${pdbName}_complx_cg_em.edr -o ${pdbName}_complx_potentialcg.xvg\n`,
      // `grace -nxy ${pdbName}_complx_potentialcg.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_potentialcg.png\n\n`,
      "#equilibrationnvt\n",
      `gmx grompp -f nvt.mdp -c ${pdbName}_complx_sd_em.gro -r ${pdbName}_complx_sd_em.gro -p ${pdbName}_complx.top -o ${pdbName}_complx_nvt.tpr -maxwarn 20\n`,
      `gmx mdrun -v -s ${pdbName}_complx_nvt.tpr -deffnm ${pdbName}_complx_nvt\n`,
      `echo "16 0" | gmx energy -f ${pdbName}_complx_nvt.edr -o ${pdbName}_complx_temperature_nvt.xvg\n`,
      `grace -nxy ${pdbName}_complx_temperature_nvt.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_temperature_nvt.png\n\n`,
      "#equilibrationnpt\n",
      `gmx grompp -f npt.mdp -c ${pdbName}_complx_nvt.gro -r ${pdbName}_complx_nvt.gro -p ${pdbName}_complx.top -o ${pdbName}_complx_npt.tpr -maxwarn 20\n`,
      `gmx mdrun -v -s ${pdbName}_complx_npt.tpr -deffnm ${pdbName}_complx_npt\n`,
      `echo "16 0" | gmx energy -f ${pdbName}_complx_npt.edr -o ${pdbName}_temperature_npt.xvg\n`,
      `grace -nxy ${pdbName}_temperature_npt.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_temperature_npt.png\n`,
      "#productionmd\n",
      `gmx grompp -f md_pr.mdp -c ${pdbName}_complx_npt.gro -p ${pdbName}_complx.top -o ${pdbName}_complx_pr.tpr -maxwarn 20\n`,
      `gmx mdrun -v -s ${pdbName}_complx_pr.tpr -deffnm ${pdbName}_complx_pr\n\n`,
      "#analyzemd\n",
      `echo "1 0" | gmx trjconv -s ${pdbName}_complx_pr.tpr -f ${pdbName}_complx_pr.xtc -o ${pdbName}_complx_pr_PBC.xtc -pbc mol -center\n`,
      `echo "4 4" | gmx rms -s ${pdbName}_complx_pr.tpr -f ${pdbName}_complx_pr_PBC.xtc -o ${pdbName}_complx_rmsd_prod.xvg -tu ns\n`,
      `grace -nxy ${pdbName}_complx_rmsd_prod.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_rmsd_prod.png\n`,
      // `echo "4 4" | gmx rms -s ${pdbName}_complx_pr.tpr -f ${pdbName}_complx_pr_PBC.xtc -o ${pdbName}_complx_rmsd_cris.xvg -tu ns\n`,
      // `grace -nxy ${pdbName}_complx_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_rmsd_cris.png\n`,
      // `grace -nxy ${pdbName}_complx_rmsd_prod.xvg ${pdbName}_complx_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_rmsd_prod_cris.png\n`,
      `echo "1" | gmx gyrate -s ${pdbName}_complx_pr.tpr -f ${pdbName}_complx_pr_PBC.xtc -o ${pdbName}_complx_gyrate.xvg\n`,
      `grace -nxy ${pdbName}_complx_gyrate.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_gyrate.png\n`,
      `echo "1" | gmx rmsf -s ${pdbName}_complx_pr.tpr -f ${pdbName}_complx_pr_PBC.xtc -o ${pdbName}_complx_rmsf_residue.xvg -res\n`,
      `grace -nxy ${pdbName}_complx_rmsf_residue.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_rmsf_residue.png\n`,
      `echo "1" | gmx sasa -s ${pdbName}_complx_pr.tpr -f ${pdbName}_complx_pr.xtc -o ${pdbName}_complx_solvent_accessible_surface.xvg -or ${pdbName}_complx_sas_residue.xvg\n`,
      `grace -nxy ${pdbName}_complx_solvent_accessible_surface.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_solvent_accessible_surface.png\n`,
      `grace -nxy ${pdbName}_complx_sas_residue.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_complx_sas_residue.png\n`,
    ];

    mkdirSync(`/files/${username}/${id}`, { recursive: true });
    const writeStream = createWriteStream(
      `/files/${username}/${id}/commands.txt`,
    );
    commands.forEach((value) => writeStream.write(`${value}\n`));
    writeStream.end();

    this.prepareSimulationEnvironment(
      "acpype",
      fileName,
      fileNameLigandITP,
      fileNameLigandPDB,
    );

    return { simulationId: id, commands };
  }

  async newAPOSimulation(
    fileName: string,
    fileNameOriginal: string,
    body: NewSimulationBody,
  ) {
    const [username, fullFileName] = fileName.split("/");
    const [origPDBName] = fileNameOriginal.split(".");
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

    const commands = [
      "#topology\n",
      `gmx pdb2gmx -f ${fullFileName} -o ${pdbName}.gro -p ${pdbName}.top -ff ${body.forceField} -water ${body.waterModel} -ignh -missing\n`,
      `gmx editconf -f ${pdbName}.gro -c -d ${body.boxDistance} -bt ${body.boxType} -o\n\n`,
      "#solvate\n",
      `gmx solvate -cp out.gro -cs -p ${pdbName}.top -o ${pdbName}_box\n\n`,
      "#ions\n",
      `gmx grompp -f ions.mdp -c ${pdbName}_box.gro -p ${pdbName}.top -o ${pdbName}_charged -maxwarn 2\n`,
      `echo 'SOL' | gmx genion -s ${pdbName}_charged.tpr -o ${pdbName}_charged -p ${pdbName}.top -neutral\n\n`,
      "#minimizationsteepdesc\n",
      `gmx grompp -f PME_em.mdp -c ${pdbName}_charged.gro -p ${pdbName}.top -o ${pdbName}_charged -maxwarn 2\n`,
      `gmx mdrun -v -s ${pdbName}_charged.tpr -deffnm ${pdbName}_sd_em\n`,
      `echo '10 0' | gmx energy -f ${pdbName}_sd_em.edr -o ${pdbName}_potentialsd.xvg\n`,
      `grace -nxy ${pdbName}_potentialsd.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_potentialsd.png\n\n`,
      // "#minimizationconjgrad\n",
      // `gmx grompp -f PME_cg_em.mdp -c ${pdbName}_sd_em.gro -p ${pdbName}.top -o ${pdbName}_cg_em -maxwarn 2\n`,
      // `gmx mdrun -v -s ${pdbName}_cg_em.tpr -deffnm ${pdbName}_cg_em\n`,
      // `echo '10 0' | gmx energy -f ${pdbName}_cg_em.edr -o ${pdbName}_potentialcg.xvg\n`,
      // `grace -nxy ${pdbName}_potentialcg.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_potentialcg.png\n\n`,
      "#equilibrationnvt\n",
      `gmx grompp -f nvt.mdp -c ${pdbName}_sd_em.gro -r ${pdbName}_sd_em.gro -p ${pdbName}.top -o ${pdbName}_nvt.tpr -maxwarn 2\n`,
      `gmx mdrun -v -s ${pdbName}_nvt.tpr -deffnm ${pdbName}_nvt\n`,
      `echo '16 0' | gmx energy -f ${pdbName}_nvt.edr -o ${pdbName}_temperature_nvt.xvg\n`,
      `grace -nxy ${pdbName}_temperature_nvt.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_temperature_nvt.png\n\n`,
      "#equilibrationnpt\n",
      `gmx grompp -f npt.mdp -c ${pdbName}_nvt.gro -r ${pdbName}_nvt.gro -p ${pdbName}.top -o ${pdbName}_npt.tpr -maxwarn 2\n`,
      `gmx mdrun -v -s ${pdbName}_npt.tpr -deffnm ${pdbName}_npt\n`,
      `echo '16 0' | gmx energy -f ${pdbName}_npt.edr -o ${pdbName}_temperature_npt.xvg\n`,
      `grace -nxy ${pdbName}_temperature_npt.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_temperature_npt.png\n\n`,
      "#productionmd\n",
      `gmx grompp -f md_pr.mdp -c ${pdbName}_npt.gro -p ${pdbName}.top -o ${pdbName}_pr -maxwarn 2\n`,
      `gmx mdrun -v -s ${pdbName}_pr.tpr -deffnm ${pdbName}_pr\n\n`,
      "#analyzemd\n",
      `echo '1 1' | gmx trjconv -s ${pdbName}_pr.tpr -f ${pdbName}_pr.xtc -o ${pdbName}_pr_PBC.xtc -pbc mol -center\n`,
      `echo '1 1' | gmx trjconv -s ${pdbName}_pr.tpr -f ${pdbName}_pr.xtc -o ${pdbName}_pr_PBC.gro -pbc mol -center -dump 1\n`,
      `echo '4 4' | gmx rms -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_rmsd_prod.xvg -tu ns\n`,
      `grace -nxy ${pdbName}_rmsd_prod.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsd_prod.png\n`,
      // `echo '4 4' | gmx rms -s ${pdbName}_charged.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_rmsd_cris.xvg -tu ns\n`,
      // `grace -nxy ${pdbName}_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsd_cris.png\n`,
      // `grace -nxy ${pdbName}_rmsd_prod.xvg ${pdbName}_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsd_prod_cris.png\n`,
      `echo '1' | gmx gyrate -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_gyrate.xvg\n`,
      `grace -nxy ${pdbName}_gyrate.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_gyrate.png\n`,
      `echo '1' | gmx rmsf -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_rmsf_residue.xvg -res\n`,
      `grace -nxy ${pdbName}_rmsf_residue.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsf_residue.png\n`,
      `echo '1' | gmx sasa -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_solvent_accessible_surface.xvg -or ${pdbName}_sas_residue.xvg\n`,
      `grace -nxy ${pdbName}_solvent_accessible_surface.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_solvent_accessible_surface.png\n`,
      `grace -nxy ${pdbName}_sas_residue.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_sas_residue.png\n`,
    ];

    mkdirSync(`/files/${username}/${id}`, { recursive: true });
    const writeStream = createWriteStream(
      `/files/${username}/${id}/commands.txt`,
    );
    commands.forEach((value) => writeStream.write(`${value}\n`));
    writeStream.end();

    this.prepareSimulationEnvironment(id, fileName);

    return { simulationId: id, commands };
  }

  async getSimulationDetails(username: string, simulationId: string) {
    const userFolderPath = `/files/${username}`;

    const runningFilePath = `${userFolderPath}/running`;
    const queuedFilePath = `${userFolderPath}/queued`;

    let queue = -1;

    if (existsSync(queuedFilePath)) {
      const waitingJobs = await this.simulationQueue.getJobs(["waiting"]);

      const jobIndex = waitingJobs.findIndex(
        (job) => job.data.simulationId === simulationId,
      );

      queue = jobIndex !== -1 ? jobIndex + 1 : -1;
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

    let isRunning = false;

    if (existsSync(runningFilePath)) {
      isRunning = true;
    }

    let stepData: string[] = [];
    let logData: string[] = [];

    if (existsSync(stepFilePath)) {
      stepData = readFileSync(stepFilePath, { encoding: "utf-8" })
        .split("\n")
        .filter((s) => s.length);
    }

    if (existsSync(logFilePath)) {
      logData = readFileSync(logFilePath, { encoding: "utf-8" })
        .replaceAll("\r", "\n")
        .split("\n")
        .filter((l) => l.length)
        .reverse();
      // .splice(0, 30);
    }

    let molecules = {
      macromolecule: null,
      ligand: null,
    };

    if (existsSync(molFilePath)) {
      molecules.macromolecule = readFileSync(molFilePath, {
        encoding: "utf-8",
      });
    }

    if (existsSync(ligFilePath)) {
      molecules.ligand = readFileSync(ligFilePath, { encoding: "utf-8" });
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
      isRunning,
      isStored,
      queue,
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

  async getUserFile(path: string) {
    if (!existsSync(path)) {
      return "no-results";
    }

    return readFileSync(path);
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
