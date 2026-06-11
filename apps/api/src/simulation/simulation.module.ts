import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { join } from "path";
import { fileURLToPath } from "url";

import { PrismaService } from "../prisma.service.js";

import { SimulationCleanupService } from "./simulation.cleanup.service.js";
import { SimulationController } from "./simulation.controller.js";
import { SimulationCreationService } from "./simulation.creation.service.js";
import { SimulationEventsListener } from "./simulation.events-listener.js";
import { SimulationFileService } from "./simulation.file.service.js";
import { SimulationService } from "./simulation.service.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

@Module({
  imports: [
    BullModule.registerQueue({
      name: "simulation",
      processors: [
        {
          path: join(__dirname, "simulation.processor.js"),
          concurrency: 1,
        },
      ],
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
    SimulationEventsListener,
    SimulationService,
    SimulationCreationService,
    SimulationFileService,
    SimulationCleanupService,
    PrismaService,
  ],
})
export class SimulationModule {}
