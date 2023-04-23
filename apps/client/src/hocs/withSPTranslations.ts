import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type IncomingGSP<P> = (ctx: GetStaticPropsContext) => Promise<P>;

type WithSPTranslationsPropsResult = GetStaticPropsResult<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}>;

type WithSPTranslationsOptions = {
  namespaces: string[];
  // any options you eventually would like to pass (required role...)
};

export function withSPTranslations(
  incomingGSP?: IncomingGSP<WithSPTranslationsPropsResult> | null,
  options?: WithSPTranslationsOptions
) {
  return async (
    ctx: GetStaticPropsContext
  ): Promise<WithSPTranslationsPropsResult> => {
    const namespaces = options ? options.namespaces : [];

    if (incomingGSP) {
      const incomingGSPResult = await incomingGSP(ctx);

      if ("props" in incomingGSPResult) {
        return {
          props: {
            ...incomingGSPResult.props,
            ...(await serverSideTranslations(ctx.locale ?? "en-US", [
              "common",
              "navigation",
              ...namespaces
            ]))
          }
        };
      }

      if ("redirect" in incomingGSPResult) {
        return { redirect: { ...incomingGSPResult.redirect } };
      }

      if ("notFound" in incomingGSPResult) {
        return { notFound: incomingGSPResult.notFound };
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
