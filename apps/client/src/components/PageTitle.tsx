import { GoBackButton } from "./GoBackButton";

interface PageTitleProps {
  noGoBack?: boolean;
  title: string;
}
export function PageTitle({ noGoBack, title }: PageTitleProps) {
  return (
    <div className="flex items-center gap-x-5">
      {noGoBack ? null : <GoBackButton />}
      <h2 className="max-w-2xl text-3xl font-extrabold tracking-tighter md:text-5xl">
        {title}
      </h2>
    </div>
  );
}
