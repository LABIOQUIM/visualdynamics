import { GoBackButton } from "../Button/GoBack";

interface PageTitleProps {
  noGoBack?: boolean;
  title: string;
}
export function PageTitle({ noGoBack, title }: PageTitleProps) {
  return (
    <div className="flex items-center gap-x-3 pt-2.5">
      {noGoBack ? null : <GoBackButton />}
      <h2 className="text-3xl text-primary-950 font-inter font-semibold tracking-tighter">
        {title}
      </h2>
    </div>
  );
}
