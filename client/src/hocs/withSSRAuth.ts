import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession, Session } from "next-auth";

import { authOptions } from "@app/pages/api/auth/[...nextauth]";

type IncomingGSSP<P> = (
  ctx: GetServerSidePropsContext,
  session?: Session
) => Promise<P>;

type WithAuthServerSidePropsResult = GetServerSidePropsResult<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}>;

type WithSSRAuthOptions = {
  // any options you eventually would like to pass (required role...)
};

export function withSSRAuth(
  incomingGSSP?: IncomingGSSP<WithAuthServerSidePropsResult> | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: WithSSRAuthOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<WithAuthServerSidePropsResult> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (session === null) {
      return {
        redirect: {
          destination: "/account/login?from=user-protected",
          permanent: false
        }
      };
    }

    if (incomingGSSP) {
      const incomingGSSPResult = await incomingGSSP(ctx, session);

      if ("props" in incomingGSSPResult) {
        return {
          props: {
            ...incomingGSSPResult.props,
            session,
            user: session.user
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
        session,
        user: session.user
      }
    };
  };
}
