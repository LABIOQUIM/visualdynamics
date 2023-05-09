import { useEffect, useState } from "react";
import { Beaker, Crown, Info, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { SidebarSubmenu } from "@app/components/Sidebar/SidebarSubmenu";
import { routeIsActive } from "@app/utils/route";

export function SidebarContent() {
  const { pathname } = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation(["navigation"]);
  const initialNavigationArray: NavigationSection[] = [
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
          label: "navigation:system.posts.title",
          href: "/posts"
        }
      ]
    }
  ];
  const authenticatedNavigationArray: NavigationSection[] = [
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
  ];
  const adminNavigationArray: NavigationSection[] = [
    {
      title: "navigation:admin.title",
      Icon: Crown,
      links: [
        {
          label: "navigation:admin.dashboard.title",
          href: "/admin",
          exact: true
        },
        {
          label: "navigation:admin.signup.title",
          href: "/admin/signup"
        },
        {
          label: "navigation:admin.dynamics.title",
          href: "/admin/running"
        },
        {
          label: "navigation:admin.mdp.title",
          href: "/admin/md-pr/update"
        },
        {
          label: "navigation:admin.users.title",
          href: "/admin/users"
        }
      ]
    }
  ];
  const [navigationItems, setNavigationItems] = useState<NavigationSection[]>(
    initialNavigationArray
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "ADMIN") {
        setNavigationItems([
          ...adminNavigationArray,
          ...initialNavigationArray,
          ...authenticatedNavigationArray
        ]);
      } else {
        setNavigationItems([
          ...initialNavigationArray,
          ...authenticatedNavigationArray
        ]);
      }
    } else {
      setNavigationItems(initialNavigationArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="text-gray-500 dark:text-gray-400">
      <ul className="flex flex-col gap-y-4">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <div className="mb-2 flex gap-x-1.5 px-3 font-medium text-primary-600 dark:text-primary-400">
              {section.Icon ? (
                <section.Icon className="my-auto h-5 w-5" />
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
                      />
                    ) : (
                      <li
                        className="relative h-10 px-3"
                        key={link.label}
                      >
                        <Link
                          href={link.href || "#"}
                          scroll={false}
                          className={`inline-flex h-full w-full items-center text-sm font-medium transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
                            routeIsActive(pathname, link)
                              ? "text-gray-800 dark:text-gray-100"
                              : ""
                          }`}
                        >
                          {routeIsActive(pathname, link) && (
                            <span
                              className="absolute inset-y-0 left-0 w-1 rounded-br-lg rounded-tr-lg bg-primary-600 dark:bg-primary-500"
                              aria-hidden="true"
                            />
                          )}
                          {link.Icon ? (
                            <link.Icon
                              className="h-5 w-5"
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
