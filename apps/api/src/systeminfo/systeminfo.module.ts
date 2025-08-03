import { Module } from "@nestjs/common";

import { SystemInfoController } from "./systeminfo.controller";
import { SystemInfoService } from "./systeminfo.service";

@Module({
  imports: [],
  controllers: [SystemInfoController],
  providers: [SystemInfoService],
})
export class SystemInfoModule {}
