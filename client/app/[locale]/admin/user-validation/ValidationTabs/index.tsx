"use client";
import * as Tabs from "@radix-ui/react-tabs";

import { RevalidateUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/RevalidateUsers";
import { useRejectedUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/RevalidateUsers/useRejectedUsers";
import { ValidateUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/ValidateUsers";
import { useInactiveUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/ValidateUsers/useInactiveUsers";
import { useI18n } from "@/locales/client";

export function ValidationTabs() {
  const { data: inactiveUsers } = useInactiveUsers();
  const { data: rejectedUsers } = useRejectedUsers();
  const t = useI18n();

  return (
    <Tabs.Root
      className="flex w-full flex-col"
      defaultValue="validate"
    >
      <Tabs.List className="border-mauve6 flex shrink-0">
        <Tabs.Trigger
          className="flex h-[45px] flex-1 select-none items-center justify-center border-b border-b-transparent px-5 text-lg leading-none outline-none data-[state=active]:border-b-primary-500 data-[state=active]:text-primary-400"
          value="validate"
        >
          <div className="flex items-center justify-center gap-2">
            {t("admin.validation.validate")}
            {inactiveUsers && inactiveUsers.length > 0 && (
              <div className="h-6 w-auto items-center justify-center rounded-full bg-primary-700 p-1 text-white">
                {inactiveUsers.length}
              </div>
            )}
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger
          className="flex h-[45px] flex-1 select-none items-center justify-center border-b border-b-transparent px-5 text-lg leading-none outline-none data-[state=active]:border-b-primary-500 data-[state=active]:text-primary-400"
          value="revalidate"
        >
          <div className="flex items-center justify-center gap-2">
            {t("admin.validation.revalidate")}
            {rejectedUsers && rejectedUsers.length > 0 && (
              <div className="h-6 w-auto items-center justify-center rounded-full bg-primary-700 p-1 text-white">
                {rejectedUsers.length}
              </div>
            )}
          </div>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        className="grow rounded-b-md p-5 outline-none"
        value="validate"
      >
        <ValidateUsers />
      </Tabs.Content>
      <Tabs.Content
        className="grow rounded-b-md p-5 outline-none"
        value="revalidate"
      >
        <RevalidateUsers />
      </Tabs.Content>
    </Tabs.Root>
  );
}
