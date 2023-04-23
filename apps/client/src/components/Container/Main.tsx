import { ReactNode, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Breadcrumb } from "@app/components/Breadcrumb";
import { BreadcrumbItem } from "@app/components/Breadcrumb/BreadcrumbItem";

interface IMain {
  children: ReactNode;
}

export function Main({ children }: IMain) {
  const [breadcrumbs, setBreadcrumbs] = useState<
    { href: string; label: string }[]
  >([]);
  const router = useRouter();
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
    <main className="transition-all lg:border lg:border-l-gray-400 lg:border-t-gray-400 dark:lg:border-l-gray-600 dark:lg:border-t-gray-600 duration-150 h-full lg:rounded-tl-3xl overflow-y-auto text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-950">
      <div className="transition-all duration-150 flex sticky top-0 z-30 shadow-sm shadow-gray-300 dark:shadow-gray-900 bg-gray-100 dark:bg-gray-950 gap-x-2 px-6">
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
      <div className="flex flex-col flex-1 gap-4 px-6 py-2">{children}</div>
    </main>
  );
}
