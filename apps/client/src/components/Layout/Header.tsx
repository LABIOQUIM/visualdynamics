import React, { useState } from "react";
import clsx from "clsx";
import { Beaker, Info, LayoutDashboard, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Icons } from "@app/components/Icons";

import { SelectTheme } from "../SelectTheme";

interface MainNavProps {
  setTheme: (theme: string) => void;
  theme: string;
}

export function Header({ setTheme, theme }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const { pathname } = useRouter();
  const { t } = useTranslation(["navigation"]);

  const items: NavigationSection[] = [
    {
      title: "navigation:system.title",
      Icon: Info,
      links: [
        {
          label: "navigation:system.about.title",
          href: "/system/about"
        },
        {
          label: "navigation:system.blog.title",
          href: "/system/blog"
        }
      ]
    },
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

  function toggleMobileMenu() {
    setShowMobileMenu((prevState) => !prevState);
  }

  const renderedItems = items.map((item) => {
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
                        pathname.startsWith(link.href ?? ""),
                      "text-primary-700": !pathname.startsWith(link.href ?? "")
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
    <nav className="h-14 md:h-full md:w-80 bg-zinc-800/10 p-2">
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
      <div className="hidden md:border-b md:border-b-zinc-400/50 md:pb-2 md:block md:sticky md:top-0">
        <Image
          alt="Visual Dynamics"
          className="w-2/3 mx-auto"
          height={0}
          src="/images/logo.svg"
          width={0}
        />
      </div>

      <div className="hidden md:flex md:flex-col md:mt-2 md:gap-y-4">
        <div className="mx-auto">
          <SelectTheme
            setTheme={setTheme}
            theme={theme}
          />
        </div>
        {renderedItems}
      </div>

      {showMobileMenu ? (
        <div className="absolute inset-0 z-10 top-14 bg-zinc-100 p-2 flex flex-col gap-y-4">
          {renderedItems}
        </div>
      ) : null}
    </nav>
  );
}
