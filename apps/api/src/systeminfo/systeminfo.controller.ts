import { Controller, Get } from "@nestjs/common";

import { SystemInfoService } from "./systeminfo.service";

@Controller("systemInfo")
export class SystemInfoController {
  constructor(private systemInfoService: SystemInfoService) {}

  @Get("/")
  async getCPUInfo() {
    const systemInfo = await this.systemInfoService.getSystemInfo();

    return systemInfo;
  }
}
