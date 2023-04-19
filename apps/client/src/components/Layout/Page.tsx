import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, x: 200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: 100 }}
        transition={{ type: "linear" }}
      >
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
              breadcrumbs.map((breadcrumb, index) => (
                <BreadcrumbItem
                  key={breadcrumb.href + index}
                  href={breadcrumb.href}
                >
                  {breadcrumb.label}
                </BreadcrumbItem>
              ))}
          </Breadcrumb>
        </div>
      </motion.div>
      <section className="overflow-y-auto flex flex-1 flex-col rounded-md bg-zinc-800/10 px-4 py-2.5 mx-2 md:ml-0">
        <motion.div
          initial={{ opacity: 0, x: 200, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 0, y: 100 }}
          transition={{ type: "linear" }}
        >
          {children}
        </motion.div>
      </section>
    </>
  );
}
