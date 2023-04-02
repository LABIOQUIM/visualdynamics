import React, { useState } from "react";
import { Beaker, Info, LayoutDashboard, LucideIcon, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { Icons } from "@app/components/Icons";

import { SelectTheme } from "../SelectTheme";

interface MainNavProps {
  setTheme: (theme: string) => void;
  theme: string;
}

interface NavigationItem {
  label: string;
  href?: string;
  links?: NavigationItem[];
  Icon?: LucideIcon;
}

interface NavigationSection {
  title: string;
  links: NavigationItem[];
  Icon?: LucideIcon;
}

export function Header({ setTheme, theme }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const { pathname } = useRouter();

  const items: NavigationSection[] = [
    {
      title: "features:dynamic.title",
      Icon: LayoutDashboard,
      links: [
        {
          label: "features:dynamic.apo.title",
          href: "/dynamic/apo"
        },
        {
          label: "features:dynamic.acpype.title",
          href: "/dynamic/acpype"
        }
      ]
    },
    {
      title: "features:preparation.title",
      Icon: Beaker,
      links: [
        {
          label: "features:preparation.acpype.title",
          href: "/preparation/acpype"
        }
      ]
    },

    {
      title: "features:system.title",
      Icon: Info,
      links: [
        {
          label: "features:system.about.title",
          href: "/system/about"
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
        <div className="flex gap-x-2 text-primary-950">
          {item.Icon ? <item.Icon /> : null}
          <h3>{item.title}</h3>
        </div>
        <ul>
          {item.links.map((link) => {
            return (
              <Link
                key={link.label}
                href={link.href ? link.href : "#"}
              >
                <div className="flex flex-1 text-primary-500 gap-x-2 p-2 rounded-md transition-all line-clamp-1 hover:bg-primary-50">
                  {link.Icon ? <link.Icon /> : null}
                  <p>{link.label}</p>
                </div>
              </Link>
            );
          })}
        </ul>
      </div>
    );
  });

  return (
    <nav className="h-14 md:h-full md:w-60 bg-zinc-800/10 p-2">
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
          className="w-full"
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
        <div className="absolute inset-0 top-14 bg-zinc-100 p-2 flex flex-col gap-y-4">
          {renderedItems}
        </div>
      ) : null}
    </nav>
  );
}
