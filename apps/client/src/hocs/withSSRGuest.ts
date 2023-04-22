import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@app/pages/api/auth/[...nextauth]";

type IncomingGSSP<P> = (ctx: GetServerSidePropsContext) => Promise<P>;

type WithAuthServerSidePropsResult = GetServerSidePropsResult<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}>;

type WithSSRAuthOptions = {
  // any options you eventually would like to pass (required role...)
};

export function withSSRGuest(
  incomingGSSP?: IncomingGSSP<WithAuthServerSidePropsResult> | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: WithSSRAuthOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<WithAuthServerSidePropsResult> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (session !== null) {
      return {
        redirect: {
          destination: "/my-dynamics",
          permanent: false
        }
      };
    }

    if (incomingGSSP) {
      const incomingGSSPResult = await incomingGSSP(ctx);

      if ("props" in incomingGSSPResult) {
        return {
          props: {
            ...incomingGSSPResult.props,
            session
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
        session
      }
    };
  };
}
