import { authClient } from "./auth-client";

export interface DownloadProgress {
  loaded: number;
  total: number;
}

type GetOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: "arraybuffer";
  onDownloadProgress?: (progress: DownloadProgress) => void;
};

export type SerializableJson =
  | string
  | number
  | boolean
  | null
  | SerializableJson[]
  | { [key: string]: SerializableJson };

export interface FlagConfig {
  type: string;
  defaultVariant: string;
  variants: Record<string, SerializableJson>;
  disabled: boolean;
}

const API_REQUEST_TIMEOUT_MS = 8000;

function getAPIBaseUrl() {
  return `${import.meta.env.VITE_API_BASE_URL}/v1`;
}

function createApiUrl(path: string, params?: GetOptions["params"]) {
  const origin =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(`${getAPIBaseUrl()}${path}`, origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url;
}

function getApiConnectionError(error: unknown) {
  const apiUrl = getAPIBaseUrl();
  const message =
    error instanceof Error && error.message ? error.message : "fetch failed";

  return new Error(
    `Could not reach the Visual Dynamics API at ${apiUrl}. ${message}`,
  );
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type");

  if (response.status === 204) {
    return undefined;
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || undefined;
}

function extractErrorMessage(payload: unknown, response: Response) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }

  if (typeof payload === "string") {
    return payload;
  }

  return `${response.status} ${response.statusText}`;
}

async function fetchApi<T>(
  path: string,
  init: RequestInit,
  params?: GetOptions["params"],
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(createApiUrl(path, params), {
      credentials: "include",
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    throw getApiConnectionError(error);
  } finally {
    clearTimeout(timeout);
  }

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, response));
  }

  return payload as T;
}

export async function getAPIClient() {
  const session = await authClient.getSession();
  const token = session.data?.session.token;
  const authHeader = token ? `Bearer ${token}` : "";

  return {
    delete: async <T = unknown>(
      path: string,
      options: GetOptions = {},
    ): Promise<{ data: T }> => {
      const data = await fetchApi<T>(
        path,
        {
          method: "DELETE",
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        options.params,
      );

      return { data };
    },

    get: async <T = unknown>(
      path: string,
      options: GetOptions = {},
    ): Promise<{ data: T }> => {
      const response = await fetch(createApiUrl(path, options.params), {
        method: "GET",
        headers: authHeader ? { Authorization: authHeader } : {},
        credentials: "include",
      });

      if (!response.ok) {
        const payload = await readResponsePayload(response);
        throw new Error(extractErrorMessage(payload, response));
      }

      if (options.responseType === "arraybuffer") {
        if (!options.onDownloadProgress || !response.body) {
          const data = (await response.arrayBuffer()) as T;
          return { data };
        }

        const contentLength = response.headers.get("Content-Length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body.getReader();
        const chunks: ArrayBuffer[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value.slice().buffer as ArrayBuffer);
          received += value.length;
          options.onDownloadProgress({ loaded: received, total });
        }

        const merged = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
          const bytes = new Uint8Array(chunk);
          merged.set(bytes, offset);
          offset += bytes.byteLength;
        }

        return { data: merged.buffer as T };
      }

      return { data: (await response.json()) as T };
    },

    patch: async <T = unknown>(
      path: string,
      body: Record<string, unknown>,
    ): Promise<{ data: T }> => {
      const data = await fetchApi<T>(path, {
        method: "PATCH",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return { data };
    },

    post: async <T = unknown>(
      path: string,
      body: FormData | Record<string, unknown>,
    ): Promise<{ data: T }> => {
      const headers: Record<string, string> = authHeader
        ? { Authorization: authHeader }
        : {};
      let requestBody: BodyInit;

      if (body instanceof FormData) {
        requestBody = body;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
      }

      const data = await fetchApi<T>(path, {
        method: "POST",
        headers,
        body: requestBody,
      });

      return { data };
    },
  };
}
