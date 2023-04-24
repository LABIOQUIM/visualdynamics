import { ReactNode, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Breadcrumb } from "@app/components/Breadcrumb";
import { BreadcrumbItem } from "@app/components/Breadcrumb/BreadcrumbItem";

interface IMain {
  children: ReactNode;
}

export function Main({ children }: IMain) {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const { t } = useTranslation(["common"]);

  useLayoutEffect(() => {
    const pathWithoutQuery = router.asPath.split("?")[0];
    let pathArray = pathWithoutQuery.split("/");
    pathArray.shift();

    pathArray = pathArray.filter((path) => path !== "");

    const breadcrumbs = pathArray.map((path, index) => {
      const href = "/" + pathArray.slice(0, index + 1).join("/");
      return {
        href,
        label: path
      };
    });

    setBreadcrumbs(breadcrumbs);
  }, [router.asPath]);

  return (
    <main className="flex flex-1 flex-col bg-gray-100 text-gray-800 transition-all duration-150 dark:bg-gray-950 dark:text-gray-100 lg:overflow-y-auto lg:rounded-tl-3xl lg:border lg:border-l-gray-400 lg:border-t-gray-400 dark:lg:border-l-gray-600 dark:lg:border-t-gray-600">
      <div className="sticky top-[4.5rem] z-10 flex gap-x-2 bg-gray-100 px-6 shadow-sm shadow-gray-300 transition-all duration-150 dark:bg-gray-950 dark:shadow-gray-900 lg:top-0">
        <Breadcrumb>
          <BreadcrumbItem href="/">{t("common:app-name")}</BreadcrumbItem>
          {breadcrumbs ? (
            breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem
                key={breadcrumb.href + index}
                href={breadcrumb.href}
              >
                {breadcrumb.label.replace("-", " ")}
              </BreadcrumbItem>
            ))
          ) : (
            <BreadcrumbItem
              key="loading-breadcrumb"
              href="#"
            >
              {t("common:loading")}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 py-2">{children}</div>
    </main>
  );
}
