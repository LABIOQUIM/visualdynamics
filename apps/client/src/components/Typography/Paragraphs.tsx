import { cnMerge } from "@app/utils/cnMerge";

export function Paragraph({ children, className }: TypographyProps) {
  return (
    <p className={cnMerge("text-sm lg:text-base", className)}>{children}</p>
  );
}

export function ParagraphSmall({ children, className }: TypographyProps) {
  return (
    <h1 className={cnMerge("text-xs lg:text-sm", className)}>{children}</h1>
  );
}
