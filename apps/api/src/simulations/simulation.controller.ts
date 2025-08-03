import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { SIMULATION_TYPE } from "database";
import { Express, Request } from "express";
import { writeFile } from "fs";
import multerConfig from "src/multer.config";
import { UsernameGuard } from "src/username.guard";

import { SimulationService } from "./simulation.service";
import type { NewSimulationBody } from "./simulation.types";

@Controller("simulation")
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @UseGuards(UsernameGuard)
  @Post("/acpype")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: "filePDB",
          maxCount: 1,
        },
        {
          name: "fileLigandITP",
          maxCount: 1,
        },
        {
          name: "fileLigandPDB",
          maxCount: 1,
        },
      ],
      multerConfig
    )
  )
  async newACPYPESimulation(
    @UploadedFiles()
    files: {
      filePDB: Express.Multer.File[];
      fileLigandITP: Express.Multer.File[];
      fileLigandPDB: Express.Multer.File[];
    },
    @Body() body: NewSimulationBody,
    @Req() request: Request
  ) {
    const { fileLigandITP, fileLigandPDB, filePDB } = files;
    const { simulationId, commands } =
      await this.simulationService.newACPYPESimulation(
        filePDB[0].filename,
        fileLigandITP[0].filename,
        fileLigandITP[0].originalname,
        fileLigandPDB[0].filename,
        body
      );

    if (body.shouldRun && body.shouldRun === "true") {
      await this.simulationService.addSimulationToQueue(
        simulationId,
        request.userName,
        "acpype",
        body.successEmail,
        body.errorEmail
      );

      return "added-to-queue";
    }
    writeFile(`/files/${request.userName}/acpype/ended`, "ended", (err) => {
      if (err) console.log(err);
    });

    return commands;
  }

  @UseGuards(UsernameGuard)
  @Post("/apo")
  @UseInterceptors(FileInterceptor("filePDB", multerConfig))
  async newAPOSimulation(
    @UploadedFile() filePDB: Express.Multer.File,
    @Body() body: NewSimulationBody,
    @Req() request: Request
  ) {
    if (!filePDB) {
      throw new HttpException("no-pdb-file", HttpStatus.BAD_REQUEST);
    }

    const { simulationId, commands } =
      await this.simulationService.newAPOSimulation(filePDB.filename, body);

    if (body.shouldRun && body.shouldRun === "true") {
      await this.simulationService.addSimulationToQueue(
        simulationId,
        request.userName,
        "apo",
        body.successEmail,
        body.errorEmail
      );

      return "added-to-queue";
    }

    writeFile(`/files/${request.userName}/apo/ended`, "ended", (err) => {
      if (err) console.log(err);
    });

    return commands;
  }

  @UseGuards(UsernameGuard)
  @Get("/")
  async getRunningSimulationInfo(@Req() request: Request) {
    const data = await this.simulationService.getUserRunningSimulationData(
      request.userName
    );

    return data;
  }

  @UseGuards(UsernameGuard)
  @Get("/downloads/mdp")
  async getMDPFiles() {
    const file = await this.simulationService.getMDPFiles();

    return new StreamableFile(file);
  }

  @UseGuards(UsernameGuard)
  @Get("/files")
  async getLastSimulationFiles(@Req() request: Request) {
    const data = await this.simulationService.getUserLastSimulationFiles(
      request.userName
    );

    return data;
  }

  @UseGuards(UsernameGuard)
  @Get("/download/file")
  async getUserFile(@Req() request: Request, @Query("path") path: string) {
    const file = await this.simulationService.getUserFile(path);

    if (file === "no-results") {
      throw new HttpException("no-results", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @UseGuards(UsernameGuard)
  @Get("/downloads/figures")
  async getLastSimulationFigures(
    @Req() request: Request,
    @Query("type") type: SIMULATION_TYPE
  ) {
    const file = await this.simulationService.getUserLastSimulationFigures(
      request.userName,
      type
    );

    if (file === "no-figures") {
      throw new HttpException("no-figures", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @UseGuards(UsernameGuard)
  @Get("/downloads/commands")
  async getLastSimulationCommands(
    @Req() request: Request,
    @Query("type") type: SIMULATION_TYPE
  ) {
    const file = await this.simulationService.getUserLastSimulationCommands(
      request.userName,
      type
    );

    if (file === "no-commands") {
      throw new HttpException("no-commands", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @UseGuards(UsernameGuard)
  @Get("/downloads/logs")
  async getLastSimulationGromacsLogs(
    @Req() request: Request,
    @Query("type") type: SIMULATION_TYPE
  ) {
    const file = await this.simulationService.getUserLastSimulationGromacsLogs(
      request.userName,
      type
    );

    if (file === "no-logs") {
      throw new HttpException("no-logs", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @UseGuards(UsernameGuard)
  @Get("/downloads/results")
  async getLastSimulationResults(
    @Req() request: Request,
    @Query("type") type: SIMULATION_TYPE
  ) {
    const file = await this.simulationService.getUserLastSimulationResults(
      request.userName,
      type
    );

    if (file === "no-results") {
      throw new HttpException("no-results", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @UseGuards(UsernameGuard)
  @Get("/latest")
  async getLatestSimulations(@Req() request: Request) {
    const data = this.simulationService.getUserLastSimulations(
      request.userName
    );
    return data;
  }

  @UseGuards(UsernameGuard)
  @Get("/queue-info")
  async getQueueInfo() {
    const data = this.simulationService.getQueueInfo();

    return data;
  }
}
