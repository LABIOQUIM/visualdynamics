import { User } from "@prisma/client";
import { Crown } from "lucide-react";

import { H2, ParagraphSmall } from "@/components/Typography";

import { CleanUserFolder } from "./CleanUserFolder";
import { MoreInfo } from "./MoreInfo";
import { ToggleSuspend } from "./ToggleSuspend";

interface Props {
  user: Omit<User, "password">;
}

export function ActiveUserListItem({ user }: Props) {
  return (
    <li className="min-h-24 flex flex-col justify-between gap-4 rounded-lg border border-primary-400 bg-primary-500/20 p-4 dark:border-primary-900 dark:bg-primary-500/5 xl:flex-row xl:items-center">
      <div>
        <H2 className="inline-flex gap-2">
          {user.role === "ADMIN" ? <Crown /> : null}
          {user.name}
        </H2>
        <div className="jusfity-center flex flex-col flex-wrap gap-2 lg:items-center lg:justify-start xl:flex-row">
          <ParagraphSmall>{user.username}</ParagraphSmall>
          <span className="hidden xl:inline-flex">&bull;</span>
          <ParagraphSmall>{user.email}</ParagraphSmall>
        </div>
      </div>
      <div className="flex gap-1">
        <MoreInfo user={user} />
        <CleanUserFolder user={user} />
        <ToggleSuspend user={user} />
      </div>
    </li>
  );
}
