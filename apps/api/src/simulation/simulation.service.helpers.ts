type QueueJobLike = {
  id?: string | null;
  data: {
    simulationId?: string;
  };
};

type LigandRecordLike = {
  position: number;
};

type StoredFileReader = (path: string, preserveWhitespace: boolean) => string[];
type PathExistsReader = (path: string) => boolean;

export function buildSimulationStoragePaths(
  filesRoot: string,
  username: string,
  simulationId: string,
) {
  const simulationFolderPath = `${filesRoot}/${username}/${simulationId}`;

  return {
    simulationFolderPath,
    logFilePath: `${simulationFolderPath}/run/logs/gmx.log`,
    molFilePath: `${simulationFolderPath}/run/originalMacromolecule.pdb`,
    stepFilePath: `${simulationFolderPath}/steps.txt`,
  };
}

export function getSimulationQueueState(
  simulationId: string,
  jobs: QueueJobLike[],
  waitingJobs: QueueJobLike[],
  activeJobs: QueueJobLike[],
) {
  const job = jobs.find(
    (candidate) => candidate.data.simulationId === simulationId,
  );
  const waitingJobIndex = waitingJobs.findIndex(
    (candidate) => candidate.data.simulationId === simulationId,
  );
  const isActive = activeJobs.some(
    (candidate) => candidate.data.simulationId === simulationId,
  );

  return {
    jobId: job?.id ?? "-1",
    queuePosition:
      waitingJobIndex === -1 ? -1 : waitingJobs.length - waitingJobIndex,
    isActive,
  };
}

export function readSimulationStoredArtifacts(
  paths: ReturnType<typeof buildSimulationStoragePaths>,
  ligands: LigandRecordLike[],
  pathExists: PathExistsReader,
  readStoredFile: StoredFileReader,
) {
  const { simulationFolderPath, logFilePath, molFilePath, stepFilePath } =
    paths;

  const isStored = pathExists(simulationFolderPath);
  const stepData = pathExists(stepFilePath)
    ? readStoredFile(stepFilePath, false)
    : [];
  const logData = pathExists(logFilePath)
    ? readStoredFile(logFilePath, true)
    : [];
  const macromolecule = pathExists(molFilePath)
    ? readStoredFile(molFilePath, false).join("\n")
    : null;

  const ligandPdbContents: string[] = [];

  for (const ligand of ligands) {
    const canonicalPath = `${simulationFolderPath}/run/originalLigand_${ligand.position}.pdb`;
    const fallbackPath = `${simulationFolderPath}/run/originalLigand.pdb`;

    if (pathExists(canonicalPath)) {
      ligandPdbContents.push(readStoredFile(canonicalPath, false).join("\n"));
    } else if (ligand.position === 0 && pathExists(fallbackPath)) {
      ligandPdbContents.push(readStoredFile(fallbackPath, false).join("\n"));
    }
  }

  return {
    isStored,
    stepData,
    logData,
    molecules: {
      macromolecule,
      ligands: ligandPdbContents,
    },
  };
}

export function parseSimulationProcessPid(lockContent: string) {
  const trimmed = lockContent.trim();
  const colonIdx = trimmed.indexOf(":");
  const pidStr = colonIdx >= 0 ? trimmed.slice(0, colonIdx) : trimmed;
  const pid = parseInt(pidStr, 10);

  return Number.isSafeInteger(pid) && pid > 0 ? pid : null;
}

export function parseProcessGroupIdFromStat(stat: string) {
  const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
  const pgid = parseInt(afterComm.split(" ")[2], 10);

  return Number.isSafeInteger(pgid) && pgid > 0 ? pgid : null;
}

export function terminateSimulationProcess(
  pid: number,
  ownPid: number,
  readProcStat: (pid: number) => string,
  kill: (pid: number, signal: NodeJS.Signals) => void,
) {
  const pgid = parseProcessGroupIdFromStat(readProcStat(pid));
  const ownPgid = parseProcessGroupIdFromStat(readProcStat(ownPid));

  if (pgid !== null && ownPgid !== null && pgid !== ownPgid) {
    try {
      kill(-pgid, "SIGTERM");
      return;
    } catch {
      kill(pid, "SIGTERM");
      return;
    }
  }

  kill(pid, "SIGTERM");
}

export function buildImportedLigands(row: {
  ligand_itp_name?: string;
  ligand_pdb_name?: string;
}) {
  if (!row.ligand_itp_name || !row.ligand_pdb_name) {
    return [];
  }

  return [
    {
      ligandITPName: row.ligand_itp_name,
      ligandPDBName: row.ligand_pdb_name,
      position: 0,
    },
  ];
}

export function withStorageExpiry<
  T extends { createdAt: Date; status: string },
>(record: T, getStorageExpiresAt: (record: T) => Date | null) {
  return {
    ...record,
    storageExpiresAt: getStorageExpiresAt(record),
  };
}
