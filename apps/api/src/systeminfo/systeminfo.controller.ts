import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsernameGuard } from "src/username.guard";

import { SystemInfoService } from "./systeminfo.service";

@Controller("systemInfo")
export class SystemInfoController {
  constructor(private systemInfoService: SystemInfoService) {}

  @UseGuards(UsernameGuard)
  @Get("/")
  async getCPUInfo() {
    const systemInfo = await this.systemInfoService.getSystemInfo();

    return systemInfo;
  }
}
