import { Injectable } from "@nestjs/common";
import { cpu, currentLoad, fsSize, mem } from "systeminformation";

@Injectable()
export class SystemInfoService {
  constructor() {}

  async getSystemInfo() {
    const cpuInfo = await cpu();
    const memInfo = await mem();
    const fs = await fsSize();
    const load = await currentLoad();

    return {
      cpu: {
        brand: cpuInfo.brand,
        vendor: cpuInfo.vendor,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
      },
      load: {
        current: load.currentLoad,
        average: load.avgLoad,
      },
      mem: {
        total: memInfo.total,
        used: memInfo.used,
      },
      fs: (() => {
        const rootFs = fs.find((b) => b.mount === "/");
        if (!rootFs) throw new Error("Root filesystem not found");
        return { size: rootFs.size, used: rootFs.used, available: rootFs.available };
      })(),
    };
  }
}
