import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma.service.js";

import { SimulationCleanupService } from "./simulation.cleanup.service.js";
import { SimulationConsumer } from "./simulation.consumer.js";
import { SimulationController } from "./simulation.controller.js";
import { SimulationCreationService } from "./simulation.creation.service.js";
import { SimulationEventsListener } from "./simulation.events-listener.js";
import { SimulationFileService } from "./simulation.file.service.js";
import { SimulationService } from "./simulation.service.js";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "simulation",
    }),
    BullBoardModule.forFeature({
      adapter: BullMQAdapter,
      name: "simulation",
      options: {
        description: "The Simulation Queue runs all the simulations submitted.",
      },
    }),
  ],
  controllers: [SimulationController],
  providers: [
    SimulationConsumer,
    SimulationEventsListener,
    SimulationService,
    SimulationCreationService,
    SimulationFileService,
    SimulationCleanupService,
    PrismaService,
  ],
})
export class SimulationModule {}
