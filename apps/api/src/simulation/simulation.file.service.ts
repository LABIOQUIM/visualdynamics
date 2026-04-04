import { Injectable } from "@nestjs/common";
import * as ChildProcess from "child_process";
import type { ReadStream } from "fs";
import { createReadStream, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { promisify } from "util";

const execAsync = promisify(ChildProcess.exec);

@Injectable()
export class SimulationFileService {
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
}
