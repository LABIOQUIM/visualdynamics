import type { artifactDownload } from "@/lib/constants";

// src/globals.d.ts
export {}; // This makes the file a module

declare global {
  declare const __VERSION__: string;

  type ArtifactDownloadTarget = keyof typeof artifactDownload;

  type AuthState = {
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null | undefined;
      userName: string;
      firstName?: string | null | undefined;
      lastName?: string | null | undefined;
    };
    session: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      expiresAt: Date;
      token: string;
      ipAddress?: string | null | undefined;
      userAgent?: string | null | undefined;
    };
  } | null;

  type FormSubmissionStatus =
    | { status: "loading" }
    | {
        status: "info" | "error" | "warning" | "success";
        message?: string;
        title: string;
      };

  interface Window {
    YT: typeof YT; // This will be populated by @types/youtube
    onYouTubeIframeAPIReady?: () => void;
  }
}
