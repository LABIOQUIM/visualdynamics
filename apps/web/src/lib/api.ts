import { authClient } from "./auth-client";

const BASE_URL = "http://localhost:3001/v1";

type GetOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: "arraybuffer";
};

export async function getAPIClient() {
  const session = await authClient.getSession();
  const authHeader = `Bearer ${session.data?.session.token}`;

  return {
    get: async <T = unknown>(
      path: string,
      options: GetOptions = {},
    ): Promise<{ data: T }> => {
      const url = new URL(`${BASE_URL}${path}`);
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
        const data = (await response.arrayBuffer()) as unknown as T;
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
      const response = await fetch(`${BASE_URL}${path}`, {
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
      const response = await fetch(`${BASE_URL}${path}`, {
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
  };
}
