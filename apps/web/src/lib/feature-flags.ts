import type {
  EvaluationContext,
  JsonValue,
  OpenFeatureEventEmitter,
  Provider,
  ResolutionDetails,
} from "@openfeature/web-sdk";
import { ProviderEvents } from "@openfeature/web-sdk";

import { getPublicApiUrl } from "./env";

interface FlagConfig {
  type: string;
  defaultVariant: string;
  variants: Record<string, JsonValue>;
  disabled: boolean;
}

type FlagStore = Record<string, FlagConfig>;

function getAPIBaseUrl() {
  return `${getPublicApiUrl()}/v1`;
}

export class ApiFeatureFlagProvider implements Provider {
  readonly metadata = { name: "api-feature-flag" } as const;
  readonly runsOn = "client" as const;
  events?: OpenFeatureEventEmitter;

  private flags: FlagStore = {};
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    await this.fetchFlags();
    // Poll every 60s for flag updates
    this.pollInterval = setInterval(() => this.fetchFlags(), 60_000);
  }

  async onClose(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    _context: EvaluationContext,
  ): ResolutionDetails<boolean> {
    const flag = this.flags[flagKey];

    if (!flag || flag.disabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant];
    if (typeof value !== "boolean") {
      return { value: defaultValue, reason: "ERROR" };
    }

    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    _context: EvaluationContext,
  ): ResolutionDetails<string> {
    const flag = this.flags[flagKey];

    if (!flag || flag.disabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant];
    if (typeof value !== "string") {
      return { value: defaultValue, reason: "ERROR" };
    }

    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    _context: EvaluationContext,
  ): ResolutionDetails<number> {
    const flag = this.flags[flagKey];

    if (!flag || flag.disabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant];
    if (typeof value !== "number") {
      return { value: defaultValue, reason: "ERROR" };
    }

    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    _context: EvaluationContext,
  ): ResolutionDetails<T> {
    const flag = this.flags[flagKey];

    if (!flag || flag.disabled) {
      return { value: defaultValue, reason: flag ? "DISABLED" : "DEFAULT" };
    }

    const value = flag.variants[flag.defaultVariant] as T;
    return { value, variant: flag.defaultVariant, reason: "STATIC" };
  }

  private async fetchFlags(): Promise<void> {
    try {
      const response = await fetch(`${getAPIBaseUrl()}/feature-flags/client`, {
        credentials: "include",
      });

      if (response.ok) {
        const newFlags = (await response.json()) as FlagStore;
        const changedKeys = Object.keys(newFlags).filter(
          (key) =>
            JSON.stringify(newFlags[key]) !== JSON.stringify(this.flags[key]),
        );
        this.flags = newFlags;
        if (changedKeys.length > 0) {
          this.events?.emit(ProviderEvents.ConfigurationChanged, {
            flagsChanged: changedKeys,
          });
        }
      }
    } catch {
      // Silently fail — use cached/default values
    }
  }
}
