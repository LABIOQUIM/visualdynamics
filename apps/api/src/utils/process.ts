import { readFileSync } from "fs";

export function readProcessStartTime(pid: number): string | null {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
    return afterComm.split(" ")[19] ?? null;
  } catch {
    return null;
  }
}

export function readProcessGroupId(pid: number): number | null {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2);
    const pgid = parseInt(afterComm.split(" ")[2], 10);
    return Number.isSafeInteger(pgid) && pgid > 0 ? pgid : null;
  } catch {
    return null;
  }
}

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error: unknown) {
    const code = (error as NodeJS.ErrnoException)?.code;
    return code !== "ESRCH";
  }
}

export async function terminateProcess(pid: number): Promise<boolean> {
  const pgid = readProcessGroupId(pid);
  const ownPgid = readProcessGroupId(process.pid);
  const safeToGroupKill =
    pgid !== null && pgid > 0 && ownPgid !== null && pgid !== ownPgid;

  const killTarget = (sig: NodeJS.Signals) => {
    if (safeToGroupKill) {
      try {
        process.kill(-(pgid as number), sig);
        return;
      } catch {}
    }
    try {
      process.kill(pid, sig);
    } catch {}
  };

  killTarget("SIGTERM");

  const deadline = Date.now() + 5000;
  while (isProcessRunning(pid) && Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, 100));
  }

  if (isProcessRunning(pid)) {
    killTarget("SIGKILL");
    await new Promise<void>((r) => setTimeout(r, 500));
  }

  return !isProcessRunning(pid);
}
