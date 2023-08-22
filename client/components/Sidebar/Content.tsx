"use client";
import { useEffect, useState } from "react";
import { Beaker, Crown, Info, LayoutDashboard } from "lucide-react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";

import Fiocruz from "@/assets/fiocruz.png";
import FiocruzRO from "@/assets/fiocruz-ro.png";
import FiocruzWhite from "@/assets/fiocruz-white.png";
import LABIOQUIM from "@/assets/labioquim.png";
import UFCSPA from "@/assets/ufcspa.png";
import { BlurImage } from "@/components/BlurImage";
import { SidebarLink } from "@/components/Sidebar/Link";
import { SidebarSubmenu } from "@/components/Sidebar/Submenu";
import { useTheme } from "@/contexts/theme";
import { useI18n } from "@/locales/client";
import { cnMerge } from "@/utils/cnMerge";

export function SidebarContent() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const t = useI18n();

  const initialNavigationArray: NavigationSection[] = [
    {
      title: t("navigation.system.title"),
      Icon: Info,
      links: [
        {
          label: t("navigation.system.home.title"),
          href: "/",
          exact: true
        },
        {
          label: t("navigation.system.about.title"),
          href: "/about"
        },
        {
          label: t("navigation.system.posts.title"),
          href: "/posts"
        }
      ]
    }
  ];

  const authenticatedNavigationArray: NavigationSection[] = [
    {
      title: t("navigation.simulations.title"),
      Icon: LayoutDashboard,
      links: [
        {
          label: t("navigation.simulations.my-simulations"),
          href: "/simulations",
          exact: true
        },
        {
          label: t("navigation.simulations.new-simulation"),
          href: "/new-simulation"
        }
      ]
    },
    {
      title: t("navigation.preparations.title"),
      Icon: Beaker,
      links: [
        {
          label: t("navigation.preparations.models.acpype"),
          href: "/preparations/acpype"
        }
      ]
    }
  ];

  const adminNavigationSection: NavigationItem = {
    label: t("navigation.admin.title"),
    Icon: Crown,
    links: [
      {
        label: t("navigation.admin.cms"),
        href: "/directus/admin",
        external: true
      },
      {
        label: t("navigation.admin.dashboard"),
        href: "/admin",
        exact: true
      },
      {
        label: t("navigation.admin.users"),
        href: "/admin/users",
        exact: true
      },
      {
        label: t("navigation.admin.validation"),
        href: "/admin/users/validation"
      },
      {
        label: t("navigation.admin.simulations"),
        href: "/admin/simulations"
      },
      {
        label: t("navigation.admin.settings"),
        href: "/admin/settings"
      }
    ]
  };

  const [navigationItems, setNavigationItems] = useState<NavigationSection[]>(
    initialNavigationArray
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "ADMIN") {
        setNavigationItems([
          ...[
            {
              ...initialNavigationArray[0],
              links: [
                adminNavigationSection,
                ...initialNavigationArray[0].links
              ]
            }
          ],
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
              <h5>{section.title}</h5>
            </div>
            <div className="flex flex-col gap-y-2">
              {section.links && section.links.length > 0
                ? section.links.map((link) =>
                    link.links && link.links.length > 0 ? (
                      <SidebarSubmenu
                        item={link}
                        key={link.label}
                      />
                    ) : (
                      <SidebarLink
                        key={link.label}
                        link={link}
                      />
                    )
                  )
                : null}
            </div>
          </div>
        ))}
      </ul>
      <div className="my-5 grid grid-flow-col grid-rows-2 gap-2 px-2">
        <NextLink
          href="https://www.rondonia.fiocruz.br/laboratorios/bioinformatica-e-quimica-medicinal/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BlurImage
            alt=""
            className="h-full w-full object-contain"
            src={LABIOQUIM}
          />
        </NextLink>
        <NextLink
          href="https://www.rondonia.fiocruz.br/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BlurImage
            alt=""
            className="h-full w-full object-contain"
            src={FiocruzRO}
          />
        </NextLink>
        <NextLink
          href="https://portal.fiocruz.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BlurImage
            alt=""
            className={cnMerge("h-full w-full object-contain", {
              "px-0.5": theme === "light"
            })}
            src={theme === "light" ? Fiocruz : FiocruzWhite}
            priority
          />
        </NextLink>
        <NextLink
          href="https://www.ufcspa.edu.br/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BlurImage
            alt=""
            className="h-full w-full object-contain px-0.5"
            src={UFCSPA}
          />
        </NextLink>
      </div>
    </div>
  );
}
