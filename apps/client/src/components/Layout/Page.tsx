import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import { Breadcrumb } from "@app/components/Breadcrumb";
import { BreadcrumbItem } from "@app/components/Breadcrumb/Item";

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
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<
    { href: string; label: string }[]
  >([]);

  useEffect(() => {
    const pathWithoutQuery = router.asPath.split("?")[0];
    let pathArray = pathWithoutQuery.split("/");
    pathArray.shift();

    pathArray = pathArray.filter((path) => path !== "");

    const breadcrumbs = pathArray.map((path, index) => {
      const href = "/" + pathArray.slice(0, index + 1).join("/");
      return {
        href,
        label: path.charAt(0).toUpperCase() + path.slice(1)
      };
    });

    setBreadcrumbs(breadcrumbs);
  }, [router.asPath]);

  return (
    <>
      <PageTitle title={title} />
      <HeaderSEO
        title={title}
        description={description}
        ogImage={ogImage}
      />
      <div className="flex gap-x-2">
        <Breadcrumb>
          <BreadcrumbItem href="/">
            <Image
              alt="favicon"
              className="h-4 w-4 my-auto"
              src="/images/favicon.svg"
              height={0}
              width={0}
            />
          </BreadcrumbItem>
          {breadcrumbs &&
            breadcrumbs.map((breadcrumb) => (
              <BreadcrumbItem
                key={breadcrumb.href}
                href={breadcrumb.href}
              >
                {breadcrumb.label}
              </BreadcrumbItem>
            ))}
        </Breadcrumb>
      </div>
      <section className="overflow-y-auto flex flex-1 flex-col rounded-md bg-zinc-800/10 px-4 pb-5 pt-2.5 mx-2 md:ml-0">
        {children}
      </section>
    </>
  );
}
