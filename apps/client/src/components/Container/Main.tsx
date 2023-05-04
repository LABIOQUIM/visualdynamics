import { ReactNode } from "react";

interface IMain {
  children: ReactNode;
}

export function Main({ children }: IMain) {
  return (
    <main className="flex flex-1 flex-col border-b-transparent border-r-transparent bg-zinc-100 text-zinc-800 transition-all duration-150 dark:bg-zinc-950 dark:text-zinc-100 lg:overflow-y-auto lg:rounded-tl-3xl lg:border lg:border-l-zinc-400 lg:border-t-zinc-400 dark:lg:border-l-zinc-600 dark:lg:border-t-zinc-600">
      <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
    </main>
  );
}
