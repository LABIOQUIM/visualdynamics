import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { join } from "path";

import { PrismaService } from "../prisma.service";

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
          // Prevent stalled jobs from being automatically re-queued.
          // When the API restarts, any active sandboxed processor continues running
          // as a separate OS process. Without this setting, BullMQ would move the
          // stalled job back to "waiting" (default maxStalledCount: 1) and spawn a
          // second processor for the same simulation, causing two processes to write
          // to the same files simultaneously. Setting maxStalledCount to 0 makes
          // stalled jobs immediately move to the "failed" state instead.
          maxStalledCount: 0,
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
  providers: [SimulationEventsListener, SimulationService, PrismaService],
})
export class SimulationModule {}
