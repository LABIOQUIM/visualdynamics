import { useEffect, useState } from "react";
import { Beaker, Crown, Info, LayoutDashboard } from "lucide-react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

import { BlurImage } from "@app/components/general/blur-image";
import { useTheme } from "@app/context/ThemeContext";

const SidebarItem = dynamic(
  () =>
    import("@app/components/general/sidebar/item").then((m) => m.SidebarItem),
  {
    ssr: false
  }
);

const SidebarSubmenu = dynamic(
  () =>
    import("@app/components/general/sidebar/submenu").then(
      (m) => m.SidebarSubmenu
    ),
  {
    ssr: false
  }
);

export function SidebarContent() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
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
  const adminNavigationSection: NavigationItem = {
    label: "navigation:admin.title",
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
                      <SidebarItem
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
      <div className="my-5 grid gap-2 px-2">
        <BlurImage
          alt="LABIOQUIM"
          className="w-full p-2"
          height={0}
          src="/labioquim.png"
          unoptimized
          width={0}
        />
        <BlurImage
          alt="Fiocruz Rondônia"
          className="w-full p-2"
          height={0}
          src="/fiocruz-ro.png"
          unoptimized
          width={0}
        />
        <BlurImage
          alt="Fiocruz"
          className="w-full p-2"
          height={0}
          src={theme === "light" ? "/fiocruz.png" : "/fiocruz-white.png"}
          unoptimized
          width={0}
        />
        <BlurImage
          alt="UFCSPA"
          className="w-full p-2"
          height={0}
          src="/ufcspa.png"
          unoptimized
          width={0}
        />
      </div>
    </div>
  );
}
