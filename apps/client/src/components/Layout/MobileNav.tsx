import { useLockBody } from "@app/hooks/use-lock-body";

import { Auth } from "../Auth";

interface MobileNavProps {
  renderedItems: JSX.Element[];
}

export function MobileNav({ renderedItems }: MobileNavProps) {
  useLockBody();

  return (
    <div className="md:hidden absolute inset-0 z-10 top-14 bg-zinc-200/80 backdrop-blur-md p-2 flex flex-col gap-y-4">
      <Auth />
      {renderedItems}
    </div>
  );
}
