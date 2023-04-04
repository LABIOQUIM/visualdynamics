import { ReactNode } from "react";
import Image from "next/image";

import { HeaderSEO } from "./HeaderSEO";
import { PageTitle } from "./PageTitle";

interface PageLayoutProps extends HeaderSEOProps {
  children: ReactNode;
  title: string;
}

export function PageLayout({
  children,
  title,
  description,
  ogImage
}: PageLayoutProps) {
  return (
    <>
      <PageTitle title={title} />
      <HeaderSEO
        title={title}
        description={description}
        ogImage={ogImage}
      />
      <div className="flex gap-x-2">
        <Image
          alt="favicon"
          className="h-4 w-4 my-auto"
          src="/images/favicon.svg"
          height={0}
          width={0}
        />
        <p>/</p>
        <p>Dinâmicas</p>
        <p>/</p>
        <p>APO</p>
      </div>
      <section className="overflow-y-auto flex flex-1 flex-col rounded-md bg-zinc-800/10 px-4 py-5 mx-2 md:ml-0">
        {children}
      </section>
    </>
  );
}
