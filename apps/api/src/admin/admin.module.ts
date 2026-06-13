import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma.service.js";

import { AdminController } from "./admin.controller.js";

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [PrismaService],
})
export class AdminModule {}
