import { Module } from "@nestjs/common";

import { SystemInfoController } from "./systeminfo.controller.js";
import { SystemInfoService } from "./systeminfo.service.js";

@Module({
  imports: [],
  controllers: [SystemInfoController],
  providers: [SystemInfoService],
})
export class SystemInfoModule {}
