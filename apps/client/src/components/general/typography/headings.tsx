import { cnMerge } from "@app/utils/cnMerge";

export function H1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cnMerge(
        "text-xl font-semibold text-primary-600 dark:text-primary-400 lg:text-2xl",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cnMerge("text-lg font-medium lg:text-xl", className)}>
      {children}
    </h2>
  );
}
