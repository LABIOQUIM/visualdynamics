import { Injectable } from "@nestjs/common";
import * as ChildProcess from "child_process";
import type { ReadStream } from "fs";
import {
  createReadStream,
  existsSync,
  lstatSync,
  readdirSync,
  rmSync,
  statSync,
} from "fs";
import { join, relative, resolve } from "path";
import { tmpdir } from "os";
import { cwd } from "process";
import { promisify } from "util";

import { getFilesRoot } from "../utils/filesRoot.js";

const execAsync = promisify(ChildProcess.exec);

export interface FolderEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  lastModified: number;
}

@Injectable()
export class SimulationFileService {
  async getSimulationFigures(
    userName: string,
    simulationId: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-figures"> {
    const userFolderPath = `${getFilesRoot()}/${userName}`;
    const runFolderPath = `${getFilesRoot()}/${userName}/${simulationId}/run`;
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
    const sourceFolderPath = `${cwd()}/static/mdp`;
    const zipPath = join(
      tmpdir(),
      `mdpfiles-${process.pid}-${Date.now()}.zip`,
    );

    await execAsync(`zip -r ${zipPath} *.mdp`, { cwd: sourceFolderPath });

    const stream = createReadStream(zipPath);
    const cleanup = () => rmSync(zipPath, { force: true });
    stream.on("close", cleanup);
    stream.on("error", cleanup);

    return { stream, size: statSync(zipPath).size };
  }

  async getSimulationCommands(
    userName: string,
    simulationId: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-commands"> {
    const userFolderPath = `${getFilesRoot()}/${userName}`;
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
    const userFolderPath = `${getFilesRoot()}/${userName}`;
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
    const userFolderPath = `${getFilesRoot()}/${userName}`;
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

  async cleanUserFolder(username: string): Promise<void> {
    const folder = `${getFilesRoot()}/${username}`;

    if (existsSync(folder)) {
      rmSync(folder, { recursive: true });
    }
  }

  listUserFolder(username: string, relativePath = ""): FolderEntry[] {
    const userRoot = resolve(getFilesRoot(), username);
    const targetPath = relativePath
      ? resolve(userRoot, relativePath)
      : userRoot;

    if (!targetPath.startsWith(userRoot)) {
      return [];
    }

    if (!existsSync(targetPath)) {
      return [];
    }

    try {
      const entries = readdirSync(targetPath);

      return entries.map((name) => {
        const fullPath = join(targetPath, name);
        const stat = lstatSync(fullPath);

        return {
          name,
          path: relative(userRoot, fullPath),
          type: stat.isDirectory() ? "directory" : "file",
          size: stat.isDirectory() ? 0 : stat.size,
          lastModified: stat.mtimeMs,
        };
      });
    } catch {
      return [];
    }
  }

  deleteUserFolderItem(
    username: string,
    relativePath: string,
  ): { success: boolean } {
    const userRoot = resolve(getFilesRoot(), username);
    const targetPath = resolve(userRoot, relativePath);

    if (!targetPath.startsWith(userRoot) || targetPath === userRoot) {
      return { success: false };
    }

    if (!existsSync(targetPath)) {
      return { success: false };
    }

    try {
      rmSync(targetPath, { recursive: true });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async getUserFile(
    path: string,
  ): Promise<{ stream: ReadStream; size: number } | "no-results"> {
    if (!existsSync(path)) {
      return "no-results";
    }

    return { stream: createReadStream(path), size: statSync(path).size };
  }

  downloadUserFile(
    username: string,
    relativePath: string,
  ): { stream: ReadStream; size: number } | "no-results" {
    const userRoot = resolve(getFilesRoot(), username);
    const targetPath = resolve(userRoot, relativePath);

    if (!targetPath.startsWith(userRoot) || targetPath === userRoot) {
      return "no-results";
    }

    if (!existsSync(targetPath)) {
      return "no-results";
    }

    const stat = lstatSync(targetPath);
    if (stat.isDirectory()) {
      return "no-results";
    }

    return { stream: createReadStream(targetPath), size: stat.size };
  }
}
