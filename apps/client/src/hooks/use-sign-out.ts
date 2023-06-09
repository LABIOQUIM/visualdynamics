import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export function useSignOut() {
  const router = useRouter();
  const { status } = useSession();

  const nonRedirectPages = [
    { path: "/about", exact: false },
    { path: "/", exact: true },
    { path: "/posts", exact: false },
    { path: "/account/recover", exact: false },
    { path: "/404", exact: false }
  ];

  useEffect(() => {
    const cannotRedirect = nonRedirectPages.some(
      (nrp) =>
        (nrp.exact && router.pathname === nrp.path) ||
        (!nrp.exact && router.pathname.startsWith(nrp.path))
    );
    if (status !== "authenticated") {
      if (!cannotRedirect) {
        router.replace("/signin");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
}
