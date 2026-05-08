import { authClient } from "./auth-client";
import { getPublicApiUrl } from "./env";

function getAPIBaseUrl() {
  return `${getPublicApiUrl()}/v1`;
}

type GetOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: "arraybuffer";
  onDownloadProgress?: (progress: number) => void;
};

export async function getAPIClient() {
  const session = await authClient.getSession();
  const authHeader = `Bearer ${session.data?.session.token}`;

  return {
    get: async <T = unknown>(
      path: string,
      options: GetOptions = {},
    ): Promise<{ data: T }> => {
      const url = new URL(`${getAPIBaseUrl()}${path}`);
      if (options.params) {
        for (const [key, value] of Object.entries(options.params)) {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        }
      }
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: authHeader },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      if (options.responseType === "arraybuffer") {
        if (!options.onDownloadProgress || !response.body) {
          const data = (await response.arrayBuffer()) as unknown as T;
          return { data };
        }

        const contentLength = response.headers.get("Content-Length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body.getReader();
        const chunks: ArrayBuffer[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value.slice().buffer as ArrayBuffer);
          received += value.length;
          if (total > 0) {
            options.onDownloadProgress((received / total) * 100);
          }
        }

        const merged = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
          const bytes = new Uint8Array(chunk);
          merged.set(bytes, offset);
          offset += bytes.byteLength;
        }

        const data = merged.buffer as unknown as T;
        return { data };
      }
      const data = (await response.json()) as T;
      return { data };
    },

    post: async <T = unknown>(
      path: string,
      body: FormData | Record<string, unknown>,
    ): Promise<{ data: T }> => {
      const headers: Record<string, string> = { Authorization: authHeader };
      let requestBody: BodyInit;
      if (body instanceof FormData) {
        requestBody = body;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
      }
      const response = await fetch(`${getAPIBaseUrl()}${path}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: requestBody,
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      return { data };
    },

    patch: async <T = unknown>(
      path: string,
      body: Record<string, unknown>,
    ): Promise<{ data: T }> => {
      const response = await fetch(`${getAPIBaseUrl()}${path}`, {
        method: "PATCH",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      return { data };
    },

    delete: async <T = unknown>(path: string): Promise<{ data: T }> => {
      const response = await fetch(`${getAPIBaseUrl()}${path}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      return { data };
    },
  };
}
