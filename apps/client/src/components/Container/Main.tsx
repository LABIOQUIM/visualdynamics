import { ReactNode, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Breadcrumb } from "../Breadcrumb";
import { BreadcrumbItem } from "../Breadcrumb/BreadcrumbItem";

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
        label: path.charAt(0).toUpperCase() + path.slice(1)
      };
    });

    setBreadcrumbs(breadcrumbs);
  }, [router.asPath]);

  return (
    <main className="transition-all border border-l-gray-400 border-t-gray-400 dark:border-l-gray-600 dark:border-t-gray-600 duration-150 h-full lg:rounded-tl-3xl overflow-y-auto text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-950">
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
      <div className="container grid gap-6 px-6 py-2">{children}</div>
    </main>
  );
}
