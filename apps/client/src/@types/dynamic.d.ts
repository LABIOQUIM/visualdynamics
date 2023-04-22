declare global {
  type Dynamic = {
    timestamp: string;
    molecule: string;
    type: "APO" | "ACPYPE";
    celeryId: string;
    isRunning: boolean;
    status: "queued" | "canceled" | "finished" | "running" | "error";
    errored_command: string | null;
  };
}

export {};
