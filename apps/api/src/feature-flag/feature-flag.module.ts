import { Module, OnModuleInit } from "@nestjs/common";
import { OpenFeature } from "@openfeature/server-sdk";

import { PrismaService } from "../prisma.service.js";

import { FeatureFlagController } from "./feature-flag.controller.js";
import { FeatureFlagService } from "./feature-flag.service.js";
import { PrismaFeatureFlagProvider } from "./prisma-feature-flag.provider.js";

@Module({
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService, PrismaService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const provider = new PrismaFeatureFlagProvider(this.prisma);
    await OpenFeature.setProviderAndWait(provider);
  }
}
