declare global {
  type Simulation = {
    timestamp: string;
    molecule: string;
    type: "APO" | "ACPYPE" | "PRODRG";
    celeryId: string;
    isRunning: boolean;
    status: "queued" | "canceled" | "finished" | "running" | "error";
    errored_command: string | null;
  };
}

export {};
