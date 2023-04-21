import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Beaker, Info, LayoutDashboard, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Icons } from "@app/components/Icons";

import { Auth } from "../Auth";

interface MainNavProps {
  setTheme: (theme: string) => void;
  theme: string;
}

export function Header({ setTheme, theme }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
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
          href: "/"
        },
        {
          label: "navigation:system.about.title",
          href: "/system/about"
        },
        {
          label: "navigation:system.blog.title",
          href: "/system/blog"
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

  function toggleMobileMenu() {
    setShowMobileMenu((prevState) => !prevState);
  }

  const renderedItems = navigationItems.map((item) => {
    return (
      <div
        className="flex flex-col gap-1"
        key={item.title}
      >
        <div className="flex gap-x-2 text-primary-950 transition-all duration-500">
          {item.Icon ? <item.Icon /> : null}
          <h3>{t(item.title)}</h3>
        </div>
        <div className="flex flex-col gap-y-0.5">
          {item.links.map((link) => {
            return (
              <Link
                key={link.label}
                href={link.href ? link.href : "#"}
              >
                <div
                  className={clsx(
                    "flex flex-1 text-primary-50 duration-500 gap-x-2 p-2 rounded-md transition-all line-clamp-1 hover:bg-primary-50",
                    {
                      "bg-primary-900 hover:bg-primary-800":
                        link.href === "/"
                          ? pathname === link.href
                          : pathname.startsWith(link.href ?? ""),
                      "text-primary-700":
                        link.href === "/"
                          ? pathname !== link.href
                          : !pathname.startsWith(link.href ?? "")
                    }
                  )}
                >
                  {link.Icon ? <link.Icon /> : null}
                  <p>{t(link.label)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <nav className="h-14 md:overflow-y-auto md:pb-4 md:h-screen md:w-80 bg-zinc-800/10">
      <div className="flex flex-1 h-full justify-between md:hidden">
        <Image
          alt="Visual Dynamics"
          className="h-full w-full"
          height={0}
          src="/images/logo.svg"
          width={0}
        />
        <button
          className=""
          onClick={toggleMobileMenu}
        >
          {showMobileMenu ? <Icons.Close /> : <Menu />}
        </button>
      </div>
      <div className="hidden bg-zinc-200/90 backdrop-blur-md md:border-b md:h-24 md:border-b-zinc-400/50 md:py-2 md:block  md:sticky md:top-0">
        <Image
          alt="Visual Dynamics"
          className="h-full w-2/3 mx-auto mb-2"
          height={0}
          src="/images/logo.svg"
          width={0}
        />
      </div>

      <div className="hidden bg-zinc-200/90 md:flex md:flex-col md:gap-y-4 md:px-2 md:items-center md:w-full md:py-2 md:shadow-lg backdrop-blur-md md:sticky md:top-24">
        <Auth
          setTheme={setTheme}
          theme={theme}
        />
      </div>

      <div className="hidden md:flex md:flex-col md:pt-2 md:gap-y-4 md:px-2">
        {renderedItems}
      </div>

      {showMobileMenu ? (
        <div className="absolute inset-0 z-10 top-14 bg-zinc-100 p-2 flex flex-col gap-y-4">
          <Auth
            setTheme={setTheme}
            theme={theme}
          />
          {renderedItems}
        </div>
      ) : null}
    </nav>
  );
}
