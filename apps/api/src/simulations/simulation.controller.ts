import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express, Request } from "express";
import multerConfig from "src/multer.config";
import { UsernameGuard } from "src/username.guard";

import { SimulationService } from "./simulation.service";
import type { NewSimulationBody } from "./simulation.types";

@Controller("simulation")
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @UseGuards(UsernameGuard)
  @Post("/acpype")
  @UseInterceptors(FileInterceptor("filePDB", multerConfig))
  @UseInterceptors(FileInterceptor("fileLigandITP", multerConfig))
  @UseInterceptors(FileInterceptor("fileLigandPDB", multerConfig))
  async newACPYPESimulation(
    @UploadedFile() filePDB: Express.Multer.File,
    @UploadedFile() fileLigandITP: Express.Multer.File,
    @UploadedFile() fileLigandPDB: Express.Multer.File,
    @Body() body: NewSimulationBody
  ) {
    // await this.simulationService.newAPOSimulation(filePDB.filename, body);
  }

  @UseGuards(UsernameGuard)
  @Post("/apo")
  @UseInterceptors(FileInterceptor("filePDB", multerConfig))
  async newAPOSimulation(
    @UploadedFile() filePDB: Express.Multer.File,
    @Body() body: NewSimulationBody,
    @Req() request: Request
  ) {
    const simulationId = await this.simulationService.newAPOSimulation(
      filePDB.filename,
      body
    );
    if (body.shouldRun) {
      await this.simulationService.addSimulationToQueue(
        simulationId,
        request.userName,
        "APO"
      );
    }
  }
}
