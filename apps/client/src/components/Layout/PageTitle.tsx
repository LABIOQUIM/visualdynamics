import { GoBackButton } from "../Button/GoBack";

interface PageTitleProps {
  noGoBack?: boolean;
  title: string;
}
export function PageTitle({ noGoBack, title }: PageTitleProps) {
  return (
    <div className="flex items-center gap-x-3 p-2">
      {noGoBack ? null : <GoBackButton />}
      <h2 className="text-3xl font-inter font-semibold tracking-tighter">
        {title}
      </h2>
    </div>
  );
}
