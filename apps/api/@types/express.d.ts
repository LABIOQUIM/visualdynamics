import { auth } from "@/src/lib/auth";

declare global {
  declare namespace Express {
    export interface Request {
      session?: typeof auth.$Infer.Session;
    }
  }
}
