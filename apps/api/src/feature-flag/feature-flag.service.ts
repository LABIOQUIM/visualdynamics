import { Injectable } from "@nestjs/common";

import type { FEATURE_FLAG_TYPE, Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class FeatureFlagService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.featureFlag.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findByKey(key: string) {
    return this.prisma.featureFlag.findUnique({ where: { key } });
  }

  create(data: {
    key: string;
    type: FEATURE_FLAG_TYPE;
    enabled: boolean;
    defaultVariant: string;
    variants: Prisma.InputJsonValue;
    description?: string;
  }) {
    return this.prisma.featureFlag.create({ data });
  }

  update(
    key: string,
    data: {
      enabled?: boolean;
      defaultVariant?: string;
      variants?: Prisma.InputJsonValue;
      description?: string;
    },
  ) {
    return this.prisma.featureFlag.update({
      where: { key },
      data,
    });
  }

  delete(key: string) {
    return this.prisma.featureFlag.delete({ where: { key } });
  }

  async getAllFlagsForClient() {
    const flags = await this.prisma.featureFlag.findMany({
      where: { enabled: true },
    });

    const result: Record<
      string,
      {
        type: string;
        defaultVariant: string;
        variants: Record<string, unknown>;
        disabled: boolean;
      }
    > = {};

    for (const flag of flags) {
      result[flag.key] = {
        type: flag.type,
        defaultVariant: flag.defaultVariant,
        variants: flag.variants as Record<string, unknown>,
        disabled: false,
      };
    }

    return result;
  }
}
