import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { SimulationConsumer } from "./simulation.consumer";
import { SimulationController } from "./simulation.controller";
import { SimulationService } from "./simulation.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "simulation",
    }),
    BullBoardModule.forFeature({
      name: "simulation",
      adapter: BullAdapter, // or use BullAdapter if you're using bull instead of bullMQ
    }),
  ],
  controllers: [SimulationController],
  providers: [SimulationService, SimulationConsumer, PrismaService],
})
export class SimulationModule {}
