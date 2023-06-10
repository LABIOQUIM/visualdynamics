import { User } from "next-auth";

declare global {
  type PropsWithUser<P = object> = P & {
    user: User;
  };
}
