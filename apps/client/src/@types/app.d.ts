import { User } from "next-auth";

declare global {
  type PropsWithUser<P = object> = P & {
    user: User;
  };

  type Tree =
    | PureTree
    | {
        status: "not-found";
      };

  type PureTree = {
    type: "directory" | "file";
    name: string;
    children?: PureTree[];
  };
}
