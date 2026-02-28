import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  StreamableFile,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Session } from "@thallesp/nestjs-better-auth";
import { Express, Request } from "express";
import multerConfig from "src/multer.config";

import { SIMULATION_TYPE } from "../generated/prisma/client";
import { SimulationUpdateInput } from "../generated/prisma/models";
import { auth } from "../lib/auth";

import { SimulationService } from "./simulation.service";
import type { NewSimulationBody } from "./simulation.types";

@Controller("simulation")
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @Post("/submit")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "filePDB", maxCount: 1 },
        { name: "fileLigandITP", maxCount: 1 },
        { name: "fileLigandPDB", maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  async newSimulation(
    @UploadedFiles()
    files: {
      filePDB?: Express.Multer.File[];
      fileLigandITP?: Express.Multer.File[];
      fileLigandPDB?: Express.Multer.File[];
    },
    @Body() body: NewSimulationBody,
    @Req() request: Request,
  ) {
    const { filePDB, fileLigandITP, fileLigandPDB } = files ?? {};

    if (!filePDB?.[0]) {
      throw new HttpException(
        { status: "no-pdb-file" },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Object.values(SIMULATION_TYPE).includes(body.type)) {
      throw new HttpException(
        { status: "invalid-simulation-type" },
        HttpStatus.BAD_REQUEST,
      );
    }

    let simulationId: string;
    let commands: string[];

    if (body.type === "acpype") {
      if (!fileLigandITP?.[0] || !fileLigandPDB?.[0]) {
        throw new HttpException(
          { status: "missing-ligand-files" },
          HttpStatus.BAD_REQUEST,
        );
      }

      ({ simulationId, commands } =
        await this.simulationService.newACPYPESimulation(
          filePDB[0].filename,
          filePDB[0].originalname,
          fileLigandITP[0].filename,
          fileLigandITP[0].originalname,
          fileLigandPDB[0].filename,
          fileLigandPDB[0].originalname,
          body,
        ));
    } else {
      ({ simulationId, commands } =
        await this.simulationService.newAPOSimulation(
          filePDB[0].filename,
          filePDB[0].originalname,
          body,
        ));
    }

    if (body.shouldRun && body.shouldRun === "true") {
      await this.simulationService.addSimulationToQueue(
        simulationId,
        request.session.user.username,
        body.type,
        body.successEmail,
        body.errorEmail,
      );

      return { status: "added-to-queue", simulationId };
    }

    return { status: "generated", commands };
  }

  @Get("/")
  async getSimulationInfo(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const data = await this.simulationService.getSimulationDetails(
      session.user.username,
      simulationId,
    );

    if (!data) {
      throw new NotFoundException("Simulation not found");
    }

    if (
      data.simulation.user.username !== session.user.username &&
      session.user.role !== "admin"
    ) {
      throw new UnauthorizedException("Unauthorized");
    }

    return data;
  }

  @Get("/current-user")
  async getUserSimulations(
    @Session() session: typeof auth.$Infer.Session,
    @Query("pageSize") pageSize: number = 10,
    @Query("page") page: number = 1,
  ) {
    const data = await this.simulationService.getUserSimulations(
      session.user.id,
      Number(pageSize),
      Number(page),
    );

    return data;
  }

  @Get("/management")
  async getMgmtSimulations(
    @Session() session: typeof auth.$Infer.Session,
    @Query("pageSize") pageSize: number = 10,
    @Query("page") page: number = 1,
  ) {
    if (session.user.role !== "admin") {
      throw new UnauthorizedException("Unauthorized");
    }

    const data = await this.simulationService.getMgmtSimulations(
      session.user.id,
      Number(pageSize),
      Number(page),
    );

    return data;
  }

  @Patch("/update/:id")
  async adminUpdateSimulation(
    @Session() session: typeof auth.$Infer.Session,
    @Param("id") id: string,
    @Body() body: SimulationUpdateInput,
  ) {
    if (session.user.role !== "admin") {
      throw new UnauthorizedException("Unauthorized");
    }

    const data = await this.simulationService.adminUpdateSimulation(id, body);

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
      session.user.username,
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
  async getSimulationFigures(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const file = await this.simulationService.getSimulationFigures(
      session.user.username,
      simulationId,
    );

    if (file === "no-figures") {
      throw new HttpException("no-figures", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/commands")
  async getSimulationCommands(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const file = await this.simulationService.getSimulationCommands(
      session.user.username,
      simulationId,
    );

    if (file === "no-commands") {
      throw new HttpException("no-commands", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/logs")
  async getSimulationGromacsLogs(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const file = await this.simulationService.getSimulationGromacsLogs(
      session.user.username,
      simulationId,
    );

    if (file === "no-logs") {
      throw new HttpException("no-logs", HttpStatus.OK);
    }

    return new StreamableFile(file);
  }

  @Get("/downloads/results")
  async getSimulationResults(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: SIMULATION_TYPE,
  ) {
    const file = await this.simulationService.getSimulationResults(
      session.user.username,
      simulationId,
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
    @Param("id") id: string,
  ) {
    const data = this.simulationService.getLastMacromoleculeFiles(
      session.user.username,
      id,
    );

    return data;
  }

  @Get("/queue-info")
  async getQueueInfo() {
    const data = this.simulationService.getQueueInfo();

    return data;
  }
}
