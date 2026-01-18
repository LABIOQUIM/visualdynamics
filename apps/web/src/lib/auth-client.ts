import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001/auth",
  plugins: [
    inferAdditionalFields({
      user: {
        userName: { type: "string", required: true },
        firstName: { type: "string", required: false },
        lastName: { type: "string", required: false },
        status: { type: "string", required: false, input: false },
        role: { type: "string", required: false, input: false },
      },
    }),
  ],
});
