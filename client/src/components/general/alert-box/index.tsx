import { PropsWithChildren } from "react";
import { AlertOctagon, CheckCheck, Info, XOctagon } from "lucide-react";

type Statuses = "success" | "danger" | "warning" | "normal";

interface AlertBoxProps {
  status?: Statuses;
}

const availableStatuses = {
  normal:
    "bg-primary-500/10 border-primary-600 text-primary-800 dark:text-primary-300",
  warning:
    "bg-amber-500/10 border-amber-600 text-amber-800 dark:text-amber-300",
  danger: "bg-red-500/10 border-red-600 text-red-800 dark:text-red-300",
  success:
    "bg-emerald-500/10 border-emerald-600 text-emerald-800 dark:text-emerald-300"
};

const Icons = {
  normal: () => <Info className="min-h-[1.75rem] min-w-[1.75rem]" />,
  danger: () => <XOctagon className="min-h-[1.75rem] min-w-[1.75rem]" />,
  warning: () => <AlertOctagon className="min-h-[1.75rem] min-w-[1.75rem]" />,
  success: () => <CheckCheck className="min-h-[1.75rem] min-w-[1.75rem]" />
};

export function AlertBox({
  children,
  status = "normal"
}: PropsWithChildren<AlertBoxProps>) {
  const Icon = Icons[status];

  return (
    <div
      className={`flex w-full items-center gap-2 rounded-lg border p-2.5 ${availableStatuses[status]}`}
    >
      <Icon />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
