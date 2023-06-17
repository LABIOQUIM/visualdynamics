import { PropsWithChildren, RefAttributes } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { TextButton } from "@app/components/general/buttons/Text";
import { H1 } from "@app/components/general/typography/headings";
import { ParagraphSmall } from "@app/components/general/typography/paragraphs";

interface DialogProps {
  Trigger: (
    props: RDialog.DialogTriggerProps & RefAttributes<HTMLButtonElement>
  ) => JSX.Element;
  title: string;
  description: string;
  Cancel?: () => JSX.Element;
  Submit?: () => JSX.Element;
}

export function Dialog({
  children,
  Cancel,
  description,
  Submit,
  title,
  Trigger
}: PropsWithChildren<DialogProps>) {
  return (
    <RDialog.Root>
      <RDialog.Trigger asChild>
        <Trigger />
      </RDialog.Trigger>
      <RDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
      <RDialog.Content className="fixed left-1/2 top-1/2 z-[110] flex h-fit max-h-[90%] w-11/12 flex-1 -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white p-6 dark:bg-zinc-900 lg:w-1/2">
        {/* TITLE AND DESCRIPTION */}
        <RDialog.Title asChild>
          <H1>{title}</H1>
        </RDialog.Title>
        <RDialog.Description asChild>
          <ParagraphSmall>{description}</ParagraphSmall>
        </RDialog.Description>

        {/* CONTENT */}
        <div className="my-6 flex h-full flex-1 overflow-auto">{children}</div>

        {Cancel || Submit ? (
          <div className="flex justify-end">
            {Cancel ? (
              <RDialog.Close asChild>
                <Cancel />
              </RDialog.Close>
            ) : null}
            {Submit ? (
              <RDialog.Close asChild>
                <Submit />
              </RDialog.Close>
            ) : null}
          </div>
        ) : null}
        <RDialog.Close asChild>
          <TextButton
            className="absolute right-6 top-6"
            aria-label="Close"
            LeftIcon={X}
            iconClassName="h-6 w-6"
          />
        </RDialog.Close>
      </RDialog.Content>
    </RDialog.Root>
  );
}
