import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
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
import { Session } from "@thallesp/nestjs-better-auth";
import { Express, Request } from "express";
import { writeFile } from "fs";
import multerConfig from "src/multer.config";
import { UsernameGuard } from "src/username.guard";

import { SIMULATION_TYPE } from "../generated/prisma/client";
import { auth } from "../lib/auth";

import { SimulationService } from "./simulation.service";
import type { NewSimulationBody } from "./simulation.types";

@Controller("simulation")
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

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
      multerConfig,
    ),
  )
  async newACPYPESimulation(
    @UploadedFiles()
    files: {
      filePDB: Express.Multer.File[];
      fileLigandITP: Express.Multer.File[];
      fileLigandPDB: Express.Multer.File[];
    },
    @Body() body: NewSimulationBody,
    @Req() request: Request,
  ) {
    const { fileLigandITP, fileLigandPDB, filePDB } = files;
    const { simulationId, commands } =
      await this.simulationService.newACPYPESimulation(
        filePDB[0].filename,
        filePDB[0].originalname,
        fileLigandITP[0].filename,
        fileLigandITP[0].originalname,
        fileLigandPDB[0].filename,
        fileLigandPDB[0].originalname,
        body,
      );

    if (body.shouldRun && body.shouldRun === "true") {
      await this.simulationService.addSimulationToQueue(
        simulationId,
        request.session.user.userName,
        "acpype",
        body.successEmail,
        body.errorEmail,
      );

      return { status: "added-to-queue", simulationId };
    }
    writeFile(
      `/files/${request.session.user.userName}/acpype/ended`,
      "ended",
      (err) => {
        if (err) console.log(err);
      },
    );

    return { status: "generated", commands };
  }

  @Post("/apo")
  @UseInterceptors(FileInterceptor("filePDB", multerConfig))
  async newAPOSimulation(
    @UploadedFile() filePDB: Express.Multer.File,
    @Body() body: NewSimulationBody,
    @Req() request: Request,
  ) {
    if (!filePDB) {
      throw new HttpException(
        { status: "no-pdb-file" },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { simulationId, commands } =
      await this.simulationService.newAPOSimulation(
        filePDB.filename,
        filePDB.originalname,
        body,
      );

    if (body.shouldRun && body.shouldRun === "true") {
      await this.simulationService.addSimulationToQueue(
        simulationId,
        request.session.user.userName,
        "apo",
        body.successEmail,
        body.errorEmail,
      );

      return { status: "added-to-queue", simulationId };
    }

    writeFile(
      `/files/${request.session.user.userName}/apo/ended`,
      "ended",
      (err) => {
        if (err) console.log(err);
      },
    );

    return { status: "generated", commands };
  }

  @Get("/")
  async getSimulationInfo(
    @Session() session: typeof auth.$Infer.Session,
    @Query("id") simulationId: string,
  ) {
    const data = await this.simulationService.getUserRunningSimulationData(
      session.user.userName,
      simulationId,
    );

    return data;
  }

  @Get("/downloads/mdp")
  async getMDPFiles() {
    const file = await this.simulationService.getMDPFiles();

    return new StreamableFile(file);
  }

  @Get("/files")
  async getLastSimulationFiles(@Session() session: typeof auth.$Infer.Session) {
    const data = await this.simulationService.getUserLastSimulationFiles(
      session.user.userName,
    );

    return data;
  }

  @Get("/download/file")
  async getUserFile(@Req() request: Request, @Query("path") path: string) {
    const file = await this.simulationService.getUserFile(path);

    if (file === "no-results") {
      throw new HttpException("no-results", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/figures")
  async getLastSimulationFigures(
    @Session() session: typeof auth.$Infer.Session,
    @Query("type") type: SIMULATION_TYPE,
  ) {
    const file = await this.simulationService.getUserLastSimulationFigures(
      session.user.userName,
      type,
    );

    if (file === "no-figures") {
      throw new HttpException("no-figures", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/commands")
  async getLastSimulationCommands(
    @Session() session: typeof auth.$Infer.Session,
    @Query("type") type: SIMULATION_TYPE,
  ) {
    const file = await this.simulationService.getUserLastSimulationCommands(
      session.user.userName,
      type,
    );

    if (file === "no-commands") {
      throw new HttpException("no-commands", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/logs")
  async getLastSimulationGromacsLogs(
    @Session() session: typeof auth.$Infer.Session,
    @Query("type") type: SIMULATION_TYPE,
  ) {
    const file = await this.simulationService.getUserLastSimulationGromacsLogs(
      session.user.userName,
      type,
    );

    if (file === "no-logs") {
      throw new HttpException("no-logs", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/results")
  async getLastSimulationResults(
    @Session() session: typeof auth.$Infer.Session,
    @Query("type") type: SIMULATION_TYPE,
  ) {
    const file = await this.simulationService.getUserLastSimulationResults(
      session.user.userName,
      type,
    );

    if (file === "no-results") {
      throw new HttpException("no-results", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/latest")
  async getLatestSimulations(@Session() session: typeof auth.$Infer.Session) {
    const data = this.simulationService.getUserLastSimulations(
      session.user.email,
    );
    return data;
  }

  @Get("/macromolecule/:type")
  async getLatestMacromoleculeFiles(
    @Session() session: typeof auth.$Infer.Session,
    @Param("type") type: SIMULATION_TYPE,
  ) {
    const data = this.simulationService.getLastMacromoleculeFiles(
      session.user.userName,
      type,
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
