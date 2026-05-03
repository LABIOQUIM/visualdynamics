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
import { OpenFeature } from "@openfeature/server-sdk";
import { Session } from "@thallesp/nestjs-better-auth";
import { Request } from "express";

import { SIMULATION_TYPE } from "../generated/prisma/client.js";
import { SimulationUpdateInput } from "../generated/prisma/models.js";
import { auth } from "../lib/auth.js";
import multerConfig from "../multer.config.js";

import { SimulationCreationService } from "./simulation.creation.service.js";
import { SimulationFileService } from "./simulation.file.service.js";
import { SimulationService } from "./simulation.service.js";
import type { NewSimulationBody } from "./simulation.types.js";

type SessionRequest = Request & {
  session?: typeof auth.$Infer.Session;
};

@Controller("simulation")
export class SimulationController {
  constructor(
    private simulationService: SimulationService,
    private simulationCreationService: SimulationCreationService,
    private simulationFileService: SimulationFileService,
  ) {}

  @Post("/submit")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "filePDB", maxCount: 1 },
        { name: "fileLigandITP", maxCount: 20 },
        { name: "fileLigandPDB", maxCount: 20 },
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
    @Req() request: SessionRequest,
  ) {
    const { filePDB, fileLigandITP, fileLigandPDB } = files ?? {};

    const flagClient = OpenFeature.getClient();
    const submissionEnabled = await flagClient.getBooleanValue(
      "simulation-submission",
      true,
    );

    if (!submissionEnabled) {
      throw new HttpException(
        { status: "submission-disabled" },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

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
      const itpFiles = fileLigandITP ?? [];
      const pdbFiles = fileLigandPDB ?? [];

      if (itpFiles.length === 0 || pdbFiles.length === 0) {
        throw new HttpException(
          { status: "missing-ligand-files" },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (itpFiles.length !== pdbFiles.length) {
        throw new HttpException(
          { status: "ligand-files-count-mismatch" },
          HttpStatus.BAD_REQUEST,
        );
      }

      const maxLigands = await flagClient.getNumberValue(
        "simulation-max-ligands",
        20,
      );

      if (itpFiles.length > maxLigands) {
        throw new HttpException(
          { status: "too-many-ligands", max: maxLigands },
          HttpStatus.BAD_REQUEST,
        );
      }

      const ligandFiles = itpFiles.map((itpFile, i) => ({
        fileNameITP: itpFile.filename,
        fileNameITPOriginal: itpFile.originalname,
        fileNamePDB: pdbFiles[i].filename,
        fileNamePDBOriginal: pdbFiles[i].originalname,
      }));

      ({ simulationId, commands } =
        await this.simulationCreationService.newACPYPESimulation(
          filePDB[0].filename,
          filePDB[0].originalname,
          ligandFiles,
          body,
        ));
    } else {
      ({ simulationId, commands } =
        await this.simulationCreationService.newAPOSimulation(
          filePDB[0].filename,
          filePDB[0].originalname,
          body,
        ));
    }

    if (body.shouldRun && body.shouldRun === "true") {
      await this.simulationCreationService.addSimulationToQueue(
        simulationId,
        request.session!.user.username!,
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
      session.user.username!,
      session.user.role === "admin",
      simulationId,
    );

    if (!data) {
      throw new NotFoundException("Simulation not found");
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

  @Post("/cancel/:id")
  async cancelSimulation(
    @Session() session: typeof auth.$Infer.Session,
    @Param("id") id: string,
  ) {
    return this.simulationService.cancelSimulation(
      id,
      session.user.id,
      session.user.role === "admin",
    );
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

  @Post("/import")
  async adminImportSimulations(
    @Session() session: typeof auth.$Infer.Session,
    @Body() body: { rows: any[] },
  ) {
    if (session.user.role !== "admin") {
      throw new UnauthorizedException("Unauthorized");
    }

    return this.simulationService.adminImportSimulations(body.rows);
  }

  @Get("/downloads/mdp")
  async getMDPFiles() {
    const file = await this.simulationFileService.getMDPFiles();

    return new StreamableFile(file.stream, {
      type: "application/zip",
      disposition: 'attachment; filename="mdpfiles.zip"',
      length: file.size,
    });
  }

  @Get("/download/file")
  async getUserFile(@Query("path") path: string) {
    const file = await this.simulationFileService.getUserFile(path);

    if (file === "no-results") {
      throw new HttpException("no-results", HttpStatus.OK);
    }

    return new StreamableFile(file.stream, {
      type: "application/octet-stream",
      disposition: "attachment",
      length: file.size,
    });
  }

  @Get("/downloads/figures")
  async getSimulationFigures(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const ownerUsername =
      await this.simulationService.getSimulationOwnerUsername(
        simulationId,
        session.user.username!,
        session.user.role === "admin",
      );

    if (!ownerUsername) {
      throw new NotFoundException("Simulation not found");
    }

    const file = await this.simulationFileService.getSimulationFigures(
      ownerUsername,
      simulationId,
    );

    if (file === "no-figures") {
      throw new HttpException("no-figures", HttpStatus.OK);
    }

    return new StreamableFile(file.stream, {
      type: "application/zip",
      disposition: `attachment; filename="figures-${simulationId}.zip"`,
      length: file.size,
    });
  }

  @Get("/downloads/commands")
  async getSimulationCommands(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const ownerUsername =
      await this.simulationService.getSimulationOwnerUsername(
        simulationId,
        session.user.username!,
        session.user.role === "admin",
      );

    if (!ownerUsername) {
      throw new NotFoundException("Simulation not found");
    }

    const file = await this.simulationFileService.getSimulationCommands(
      ownerUsername,
      simulationId,
    );

    if (file === "no-commands") {
      throw new HttpException("no-commands", HttpStatus.OK);
    }

    return new StreamableFile(file.stream, {
      type: "text/plain",
      disposition: `attachment; filename="commands-${simulationId}.txt"`,
      length: file.size,
    });
  }

  @Get("/downloads/logs")
  async getSimulationGromacsLogs(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: string,
  ) {
    const ownerUsername =
      await this.simulationService.getSimulationOwnerUsername(
        simulationId,
        session.user.username!,
        session.user.role === "admin",
      );

    if (!ownerUsername) {
      throw new NotFoundException("Simulation not found");
    }

    const file = await this.simulationFileService.getSimulationGromacsLogs(
      ownerUsername,
      simulationId,
    );

    if (file === "no-logs") {
      throw new HttpException("no-logs", HttpStatus.OK);
    }

    return new StreamableFile(file.stream, {
      type: "text/plain",
      disposition: `attachment; filename="gmx-${simulationId}.log"`,
      length: file.size,
    });
  }

  @Get("/downloads/results")
  async getSimulationResults(
    @Session() session: typeof auth.$Infer.Session,
    @Query("simulationId") simulationId: SIMULATION_TYPE,
  ) {
    const ownerUsername =
      await this.simulationService.getSimulationOwnerUsername(
        simulationId,
        session.user.username!,
        session.user.role === "admin",
      );

    if (!ownerUsername) {
      throw new NotFoundException("Simulation not found");
    }

    const file = await this.simulationFileService.getSimulationResults(
      ownerUsername,
      simulationId,
    );

    if (file === "no-results") {
      throw new HttpException("no-results", HttpStatus.OK);
    }

    return new StreamableFile(file.stream, {
      type: "application/zip",
      disposition: `attachment; filename="results-${simulationId}.zip"`,
      length: file.size,
    });
  }

  @Get("/queue-info")
  async getQueueInfo() {
    const data = this.simulationService.getQueueInfo();

    return data;
  }
}
