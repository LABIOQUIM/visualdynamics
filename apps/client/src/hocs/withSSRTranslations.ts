import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type IncomingGSSP<P> = (ctx: GetServerSidePropsContext) => Promise<P>;

type WithAuthServerSidePropsResult = GetServerSidePropsResult<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}>;

type WithSSRTranslationsOptions = {
  namespaces: string[];
  // any options you eventually would like to pass (required role...)
};

export function withSSRTranslations(
  incomingGSSP?: IncomingGSSP<WithAuthServerSidePropsResult> | null,
  options?: WithSSRTranslationsOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<WithAuthServerSidePropsResult> => {
    const namespaces = options ? options.namespaces : [];

    if (incomingGSSP) {
      const incomingGSSPResult = await incomingGSSP(ctx);

      if ("props" in incomingGSSPResult) {
        return {
          props: {
            ...incomingGSSPResult.props,
            ...(await serverSideTranslations(ctx.locale ?? "en-US", [
              "common",
              "navigation",
              ...namespaces
            ]))
          }
        };
      }

      if ("redirect" in incomingGSSPResult) {
        return { redirect: { ...incomingGSSPResult.redirect } };
      }

      if ("notFound" in incomingGSSPResult) {
        return { notFound: incomingGSSPResult.notFound };
      }
    }

    return {
      props: {
        ...(await serverSideTranslations(ctx.locale ?? "en-US", [
          "common",
          "navigation",
          ...namespaces
        ]))
      }
    };
  };
}
