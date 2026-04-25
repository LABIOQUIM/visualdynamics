import type {
  EvaluationContext,
  JsonValue,
  Logger,
  Provider,
  ResolutionDetails,
} from "@openfeature/server-sdk";

import type { PrismaService } from "../prisma.service.js";

interface FlagRow {
  key: string;
  type: string;
  enabled: boolean;
  defaultVariant: string;
  variants: Record<string, JsonValue>;
}

export class PrismaFeatureFlagProvider implements Provider {
  public readonly runsOn = "server" as const;
  readonly metadata = { name: "prisma-feature-flag" } as const;

  constructor(private readonly prisma: PrismaService) {}

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<boolean>> {
    const flag = await this.getFlag(flagKey);

    if (!flag || !flag.enabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant];
    if (typeof value !== "boolean") {
      return { value: defaultValue, reason: "ERROR" };
    }

    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<string>> {
    const flag = await this.getFlag(flagKey);

    if (!flag || !flag.enabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant];
    if (typeof value !== "string") {
      return { value: defaultValue, reason: "ERROR" };
    }

    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<number>> {
    const flag = await this.getFlag(flagKey);

    if (!flag || !flag.enabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant];
    if (typeof value !== "number") {
      return { value: defaultValue, reason: "ERROR" };
    }

    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<T>> {
    const flag = await this.getFlag(flagKey);

    if (!flag || !flag.enabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant] as T;
    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  private async getFlag(flagKey: string): Promise<FlagRow | null> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key: flagKey },
    });

    if (!flag) {
      return null;
    }

    return {
      key: flag.key,
      type: flag.type,
      enabled: flag.enabled,
      defaultVariant: flag.defaultVariant,
      variants: flag.variants as Record<string, JsonValue>,
    };
  }
}
