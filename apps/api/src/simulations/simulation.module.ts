import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";

import { SimulationController } from "./simulation.controller";
import { SimulationService } from "./simulation.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "simulation",
      processors: [join(__dirname, "simulation.processor.js")],
    }),
    BullBoardModule.forFeature({
      adapter: BullAdapter, // or use BullAdapter if you're using bull instead of bullMQ
      name: "simulation",
      options: {
        description: "The Simulation Queue runs all the simulations submitted.",
      },
    }),
  ],
  controllers: [SimulationController],
  providers: [SimulationService, PrismaService],
})
export class SimulationModule {}
