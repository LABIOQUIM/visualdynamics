import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { SIMULATION_TYPE } from "database";
import { cpSync, createWriteStream, mkdirSync, renameSync } from "fs";
import { cwd } from "process";
import { PrismaService } from "src/prisma/prisma.service";
import { normalizeString } from "src/utils/normalizeString";

import type { NewSimulationBody } from "./simulation.types";

@Injectable()
export class SimulationService {
  constructor(
    @InjectQueue("simulation") private simulationQueue: Queue,
    private prisma: PrismaService
  ) {}

  async prepareSimulationEnvironment(
    simulationType: SIMULATION_TYPE,
    fileName: string,
    fileNameLigandITP?: string,
    fileNameLigandPDB?: string
  ) {
    const [userName, fullFileName] = fileName.split("/");

    // Make *run* and *figures* directories
    mkdirSync(`/files/${userName}/${simulationType.toLowerCase()}/run/logs`, {
      recursive: true,
    });
    mkdirSync(`/files/${userName}/${simulationType.toLowerCase()}/figures`);

    // Move main molecule to *run* folder
    renameSync(
      `/files/${userName}/${fullFileName}`,
      `/files/${userName}/${simulationType.toLowerCase()}/run/${fullFileName}`
    );

    // Move ligand ITP to *run* folder
    if (fileNameLigandITP) {
      const [, fullFileNameLigandITP] = fileNameLigandITP.split("/");
      renameSync(
        `/files/${userName}/${fullFileNameLigandITP}`,
        `/files/${userName}/${simulationType.toLowerCase()}/run/${fullFileNameLigandITP}`
      );
    }

    // Move ligand PDB to *run* folder
    if (fileNameLigandPDB) {
      const [, fullFileNameLigandPDB] = fileNameLigandPDB.split("/");
      renameSync(
        `/files/${userName}/${fullFileNameLigandPDB}`,
        `/files/${userName}/${simulationType.toLowerCase()}/run/${fullFileNameLigandPDB}`
      );
    }

    // Copy all MDP files needed to run a simulation into folder
    cpSync(
      `${cwd()}/static/mdp`,
      `/files/${userName}/${simulationType.toLowerCase()}/run`,
      {
        recursive: true,
      }
    );
  }

  async addSimulationToQueue(
    simulationId: string,
    userName: string,
    type: SIMULATION_TYPE
  ) {
    await this.prisma.simulation.update({
      where: {
        id: simulationId,
      },
      data: {
        status: "QUEUED",
      },
    });
    await this.simulationQueue.add("simulate", {
      simulationId,
      userName,
      type,
    });
  }

  async newACPYPESimulation() {}
  async newAPOSimulation(fileName: string, body: NewSimulationBody) {
    const [userName, fullFileName] = fileName.split("/");
    const [origPDBName] = fullFileName.split(".");
    const pdbName = normalizeString(origPDBName);

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
      `gmx mdrun -nt 10 -v -s ${pdbName}_charged.tpr -deffnm ${pdbName}_sd_em\n`,
      `echo '10 0' | gmx energy -f ${pdbName}_sd_em.edr -o ${pdbName}_potentialsd.xvg\n`,
      `grace -nxy ${pdbName}_potentialsd.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_potentialsd.png\n\n`,
      "#minimizationconjgrad\n",
      `gmx grompp -f PME_cg_em.mdp -c ${pdbName}_sd_em.gro -p ${pdbName}.top -o ${pdbName}_cg_em -maxwarn 2\n`,
      `gmx mdrun -nt 10 -v -s ${pdbName}_cg_em.tpr -deffnm ${pdbName}_cg_em\n`,
      `echo '10 0' | gmx energy -f ${pdbName}_cg_em.edr -o ${pdbName}_potentialcg.xvg\n`,
      `grace -nxy ${pdbName}_potentialcg.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_potentialcg.png\n\n`,
      "#equilibrationnvt\n",
      `gmx grompp -f nvt.mdp -c ${pdbName}_cg_em.gro -r ${pdbName}_cg_em.gro -p ${pdbName}.top -o ${pdbName}_nvt.tpr -maxwarn 2\n`,
      `gmx mdrun -nt 10 -v -s ${pdbName}_nvt.tpr -deffnm ${pdbName}_nvt\n`,
      `echo '16 0' | gmx energy -f ${pdbName}_nvt.edr -o ${pdbName}_temperature_nvt.xvg\n`,
      `grace -nxy ${pdbName}_temperature_nvt.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_temperature_nvt.png\n\n`,
      "#equilibrationnpt\n",
      `gmx grompp -f npt.mdp -c ${pdbName}_nvt.gro -r ${pdbName}_nvt.gro -p ${pdbName}.top -o ${pdbName}_npt.tpr -maxwarn 2\n`,
      `gmx mdrun -nt 10 -v -s ${pdbName}_npt.tpr -deffnm ${pdbName}_npt\n`,
      `echo '16 0' | gmx energy -f ${pdbName}_npt.edr -o ${pdbName}_temperature_npt.xvg\n`,
      `grace -nxy ${pdbName}_temperature_npt.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_temperature_npt.png\n\n`,
      "#productionmd\n",
      `gmx grompp -f md_pr.mdp -c ${pdbName}_npt.gro -p ${pdbName}.top -o ${pdbName}_pr -maxwarn 2\n`,
      `gmx mdrun -nt 10 -v -s ${pdbName}_pr.tpr -deffnm ${pdbName}_pr\n\n`,
      "#analyzemd\n",
      `echo '1 1' | gmx trjconv -s ${pdbName}_pr.tpr -f ${pdbName}_pr.xtc -o ${pdbName}_pr_PBC.xtc -pbc mol -center\n`,
      `echo '1 1' | gmx trjconv -s ${pdbName}_pr.tpr -f ${pdbName}_pr.xtc -o ${pdbName}_pr_PBC.gro -pbc mol -center -dump 1\n`,
      `echo '4 4' | gmx rms -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_rmsd_prod.xvg -tu ns\n`,
      `grace -nxy ${pdbName}_rmsd_prod.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsd_prod.png\n`,
      `echo '4 4' | gmx rms -s ${pdbName}_charged.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_rmsd_cris.xvg -tu ns\n`,
      `grace -nxy ${pdbName}_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsd_cris.png\n`,
      `grace -nxy ${pdbName}_rmsd_prod.xvg ${pdbName}_rmsd_cris.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsd_prod_cris.png\n`,
      `echo '1' | gmx gyrate -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_gyrate.xvg\n`,
      `grace -nxy ${pdbName}_gyrate.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_gyrate.png\n`,
      `echo '1' | gmx rmsf -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_rmsf_residue.xvg -res\n`,
      `grace -nxy ${pdbName}_rmsf_residue.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_rmsf_residue.png\n`,
      `echo '1' | gmx sasa -s ${pdbName}_pr.tpr -f ${pdbName}_pr_PBC.xtc -o ${pdbName}_solvent_accessible_surface.xvg -or ${pdbName}_sas_residue.xvg\n`,
      `grace -nxy ${pdbName}_solvent_accessible_surface.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_solvent_accessible_surface.png\n`,
      `grace -nxy ${pdbName}_sas_residue.xvg -hdevice PNG -hardcopy -printfile ../figures/${pdbName}_sas_residue.png\n`,
    ];

    mkdirSync(`/files/${userName}/apo`, { recursive: true });
    const writeStream = createWriteStream(
      `/files/${userName}/apo/commands.txt`
    );
    commands.forEach((value) => writeStream.write(`${value}\n`));
    writeStream.end();

    const { id } = await this.prisma.simulation.create({
      data: {
        moleculeName: pdbName,
        status: "GENERATED",
        type: "APO",
        user: {
          connect: {
            userName,
          },
        },
      },
    });

    this.prepareSimulationEnvironment("APO", fileName);

    return id;
  }

  async newPRODRGSimulation() {}
  async getUserLastSimulations() {}
  async getUserSimulationTree() {}
}
