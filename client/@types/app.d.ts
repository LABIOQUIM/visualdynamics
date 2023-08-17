import { User } from "next-auth";

declare global {
  type PropsWithUser<P = object> = P & {
    user: User;
  };

  type PureTree = {
    type: "directory" | "file";
    name: string;
    children?: PureTree[];
  };

  type Tree =
    | PureTree
    | {
        status: "not-found";
      };
}
