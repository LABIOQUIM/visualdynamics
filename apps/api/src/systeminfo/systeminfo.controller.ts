import { Controller, Get } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";

import { auth } from "../lib/auth";

import { SystemInfoService } from "./systeminfo.service";

@Controller("systemInfo")
export class SystemInfoController {
  constructor(private systemInfoService: SystemInfoService) {}

  @Get("/")
  async getCPUInfo(@Session() _session: typeof auth.$Infer.Session) {
    const systemInfo = await this.systemInfoService.getSystemInfo();

    return systemInfo;
  }
}
