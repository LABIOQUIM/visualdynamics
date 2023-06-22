import { User } from "@prisma/client";
import { Crown } from "lucide-react";

import { CleanUserFolder } from "@app/components/admin/users/management/list/item/clean-user-folder";
import { DisableUser } from "@app/components/admin/users/management/list/item/disable-user";
import { MoreInfo } from "@app/components/admin/users/management/list/item/more-info";
import { H2 } from "@app/components/general/typography/headings";
import { ParagraphSmall } from "@app/components/general/typography/paragraphs";

interface ActiveUserListItem {
  user: User;
}

export function ActiveUserListItem({ user }: ActiveUserListItem) {
  return (
    <li className="min-h-24 flex flex-col justify-between gap-4 rounded-lg border border-primary-400 bg-primary-500/20 p-4 dark:border-primary-900 dark:bg-primary-500/5 xl:flex-row xl:items-center">
      <div>
        <H2 className="inline-flex gap-2">
          {user.role === "ADMIN" ? <Crown /> : null}
          {user.name}
        </H2>
        <div className="flex flex-col xl:flex-row">
          <ParagraphSmall>{user.username}</ParagraphSmall>
          <span className="hidden xl:inline-flex">&bull;</span>
          <ParagraphSmall>{user.email}</ParagraphSmall>
        </div>
      </div>
      <div className="flex gap-1">
        <MoreInfo user={user} />
        <CleanUserFolder user={user} />
        <DisableUser user={user} />
      </div>
    </li>
  );
}
