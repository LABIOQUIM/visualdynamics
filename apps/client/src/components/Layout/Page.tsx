import { ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Breadcrumb } from "@app/components/Breadcrumb";
import { BreadcrumbItem } from "@app/components/Breadcrumb/Item";
import { useTheme } from "@app/contexts/theme";

import { Footer } from "./Footer";
import { HeaderSEO } from "./HeaderSEO";
import { PageTitle } from "./PageTitle";

interface PageLayoutProps extends HeaderSEOProps {
  children: ReactNode;
  title: string;
  className?: string;
}

export function PageLayout({
  children,
  className,
  title,
  description,
  ogImage
}: PageLayoutProps) {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<
    { href: string; label: string }[]
  >([]);
  const { theme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { t } = useTranslation(["common"]);

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

  useEffect(() => {
    const handler = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 280);
    };

    router.events.on("routeChangeComplete", handler);

    return () => {
      router.events.off("routeChangeComplete", handler);
    };
  }, [router.events]);

  const Loading = () => (
    <div
      className={clsx("m-auto z-0", {
        "animate-slideUpEnter": !isTransitioning
      })}
      role="status"
    >
      <svg
        aria-hidden="true"
        className="w-20 h-20 text-primary-100 animate-spin fill-primary-950"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">{t("common:loading")}</span>
    </div>
  );

  const Screen = !isTransitioning ? children : <Loading />;

  return (
    <div
      className={clsx("flex flex-1 flex-col px-2.5 md:pl-0", {
        "animate-slideUpEnter": !isTransitioning
      })}
      data-theme={theme}
    >
      <PageTitle
        noGoBack={router.pathname === "/"}
        title={isTransitioning ? t("common:loading") : title}
      />
      <HeaderSEO
        title={title}
        description={description}
        ogImage={ogImage}
      />
      <div className="flex gap-x-2">
        <Breadcrumb>
          <BreadcrumbItem href="/">{t("common:app-name")}</BreadcrumbItem>
          {breadcrumbs && !isTransitioning ? (
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
      <section
        className={`overflow-y-auto flex flex-1 flex-col rounded-md bg-zinc-800/10 px-4 py-2.5 ${className}`}
      >
        {Screen}
      </section>
      <Footer />
    </div>
  );
}
