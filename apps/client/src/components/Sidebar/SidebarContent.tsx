import { useEffect, useState } from "react";
import { Beaker, Info, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { SidebarSubmenu } from "@app/components/Sidebar/SidebarSubmenu";
import { routeIsActive } from "@app/utils/route";

interface ISidebarContent {
  linkClicked: () => void;
}

export function SidebarContent({ linkClicked }: ISidebarContent) {
  const { pathname } = useRouter();
  const { status } = useSession();
  const { t } = useTranslation(["navigation"]);
  const [navigationItems, setNavigationItems] = useState<NavigationSection[]>([
    {
      title: "navigation:system.title",
      Icon: Info,
      links: [
        {
          label: "navigation:system.home.title",
          href: "/",
          exact: true
        },
        {
          label: "navigation:system.about.title",
          href: "/about"
        },
        {
          label: "navigation:system.blog.title",
          href: "/blog"
        }
      ]
    }
  ]);

  useEffect(() => {
    if (status === "authenticated") {
      setNavigationItems((previousNavigation) =>
        previousNavigation[1]
          ? previousNavigation
          : [
              ...previousNavigation,
              ...[
                {
                  title: "navigation:dynamic.title",
                  Icon: LayoutDashboard,
                  links: [
                    {
                      label: "navigation:dynamic.my-dynamics",
                      href: "/my-dynamics"
                    },
                    {
                      label: "navigation:dynamic.models.apo",
                      href: "/dynamic/apo"
                    },
                    {
                      label: "navigation:dynamic.models.acpype",
                      href: "/dynamic/acpype"
                    },
                    {
                      label: "navigation:dynamic.models.prodrg",
                      href: "/dynamic/prodrg"
                    }
                  ]
                },
                {
                  title: "navigation:preparation.title",
                  Icon: Beaker,
                  links: [
                    {
                      label: "navigation:preparation.models.acpype",
                      href: "/preparation/acpype"
                    }
                  ]
                }
              ]
            ]
      );
    } else {
      setNavigationItems((previousNavigation) => [previousNavigation[0]]);
    }
  }, [status]);

  return (
    <div className="text-gray-500 dark:text-gray-400">
      <Link href="/">
        <Image
          alt="Visual Dynamics"
          className="h-full w-9/12 mx-auto my-3"
          height={0}
          src="/images/logo.svg"
          width={0}
        />
      </Link>
      <ul className="flex flex-col gap-y-4">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <div className="flex gap-x-1.5 mb-2 px-3 font-medium text-primary-600 dark:text-primary-400">
              {section.Icon ? (
                <section.Icon className="h-5 w-5 my-auto" />
              ) : null}
              <h5>{t(section.title)}</h5>
            </div>
            <div className="flex flex-col gap-y-1">
              {section.links && section.links.length > 0
                ? section.links.map((link) =>
                    link.links && link.links.length > 0 ? (
                      <SidebarSubmenu
                        item={link}
                        key={link.label}
                        linkClicked={linkClicked}
                      />
                    ) : (
                      <li
                        className="relative px-3 h-10"
                        key={link.label}
                      >
                        <Link
                          href={link.href || "#"}
                          scroll={false}
                          className={`inline-flex h-full items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                            routeIsActive(pathname, link)
                              ? "dark:text-gray-100 text-gray-800"
                              : ""
                          }`}
                          onClick={linkClicked}
                        >
                          {routeIsActive(pathname, link) && (
                            <span
                              className="absolute inset-y-0 left-0 w-1 bg-primary-600 dark:bg-primary-500 rounded-tr-lg rounded-br-lg"
                              aria-hidden="true"
                            />
                          )}
                          {link.Icon ? (
                            <link.Icon
                              className="w-5 h-5"
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="ml-4">{t(link.label)}</span>
                        </Link>
                      </li>
                    )
                  )
                : null}
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}
