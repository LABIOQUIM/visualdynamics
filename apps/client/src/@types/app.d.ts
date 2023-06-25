import { User } from "next-auth";

declare global {
  type PropsWithUser<P = object> = P & {
    user: User;
  };

  type Tree =
    | {
        type: "directory" | "file";
        name: string;
        children?: Tree[];
      }
    | {
        status: "not-found";
      };
}
