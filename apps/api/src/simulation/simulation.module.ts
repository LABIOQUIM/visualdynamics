import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { join } from "path";

import { PrismaService } from "../prisma.service";

import { SimulationCleanupService } from "./simulation.cleanup.service";
import { SimulationController } from "./simulation.controller";
import { SimulationEventsListener } from "./simulation.events-listener";
import { SimulationService } from "./simulation.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "simulation",
      processors: [
        {
          path: join(__dirname, "simulation.processor.js"),
          // Concurrency controls how many sandboxed processes can run at once.
          concurrency: 1,
        },
      ],
    }),
    BullBoardModule.forFeature({
      adapter: BullMQAdapter, // or use BullAdapter if you're using bull instead of bullMQ
      name: "simulation",
      options: {
        description: "The Simulation Queue runs all the simulations submitted.",
      },
    }),
  ],
  controllers: [SimulationController],
  providers: [
    SimulationEventsListener,
    SimulationService,
    SimulationCleanupService,
    PrismaService,
  ],
})
export class SimulationModule {}
