import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { AllowAnonymous, Session } from "@thallesp/nestjs-better-auth";

import type { FEATURE_FLAG_TYPE, Prisma } from "../generated/prisma/client.js";
import { auth } from "../lib/auth.js";

import { FeatureFlagService } from "./feature-flag.service.js";

@Controller("feature-flags")
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  /**
   * Public endpoint: returns all enabled flags for client consumption.
   * No auth required so the frontend can bootstrap flags before login.
   */
  @AllowAnonymous()
  @Get("/client")
  async getClientFlags() {
    return this.featureFlagService.getAllFlagsForClient();
  }

  @Get("/")
  async findAll(@Session() session: typeof auth.$Infer.Session) {
    if (!session || session.user.role !== "admin") {
      throw new UnauthorizedException();
    }

    return this.featureFlagService.findAll();
  }

  @Get("/:key")
  async findByKey(
    @Param("key") key: string,
    @Session() session: typeof auth.$Infer.Session,
  ) {
    if (!session || session.user.role !== "admin") {
      throw new UnauthorizedException();
    }

    const flag = await this.featureFlagService.findByKey(key);
    if (!flag) {
      throw new NotFoundException(`Feature flag "${key}" not found`);
    }

    return flag;
  }

  @Post("/")
  async create(
    @Body()
    body: {
      key: string;
      type: FEATURE_FLAG_TYPE;
      enabled: boolean;
      defaultVariant: string;
      variants: Prisma.InputJsonValue;
      description?: string;
    },
    @Session() session: typeof auth.$Infer.Session,
  ) {
    if (!session || session.user.role !== "admin") {
      throw new UnauthorizedException();
    }

    return this.featureFlagService.create(body);
  }

  @Patch("/:key")
  async update(
    @Param("key") key: string,
    @Body()
    body: {
      enabled?: boolean;
      defaultVariant?: string;
      variants?: Prisma.InputJsonValue;
      description?: string;
    },
    @Session() session: typeof auth.$Infer.Session,
  ) {
    if (!session || session.user.role !== "admin") {
      throw new UnauthorizedException();
    }

    return this.featureFlagService.update(key, body);
  }

  @Delete("/:key")
  async remove(
    @Param("key") key: string,
    @Session() session: typeof auth.$Infer.Session,
  ) {
    if (!session || session.user.role !== "admin") {
      throw new UnauthorizedException();
    }

    return this.featureFlagService.delete(key);
  }
}
