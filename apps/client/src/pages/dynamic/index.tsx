import clsx from "clsx";
import {
  CheckCircle,
  Clock,
  FileCode,
  FileDigit,
  Image,
  RefreshCcw,
  Scroll,
  Slash,
  XCircle
} from "lucide-react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Button } from "@app/components/Button";
import { StatusButton } from "@app/components/Button/Status";
import { PageLayout } from "@app/components/Layout/Page";
import { useListDynamics } from "@app/queries/useListDynamics";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["features"]))
      // Will be passed to the page component as props
    }
  };
};

export default function MyDynamics() {
  const { data, refetch, isRefetching, isLoading } = useListDynamics(
    "IvoVieira1",
    {
      refetchOnMount: true
    }
  );
  const { t } = useTranslation(["features"]);
  const router = useRouter();

  if (data?.status === "listed") {
    return (
      <PageLayout title={t("features:list.title")}>
        <Button
          disabled={isRefetching || isLoading}
          LeftIcon={RefreshCcw}
          onClick={() => refetch()}
        >
          Reload
        </Button>
        <div className="mt-2.5 flex flex-col gap-y-1">
          {data.dynamics.map((dynamic) => (
            <div
              className={clsx(
                "p-2 flex flex-col gap-2 md:flex-row rounded-md w-full border",
                {
                  "bg-cyan-400/20 border-cyan-600":
                    dynamic.status === "running",
                  "bg-zinc-400/20 border-zinc-600":
                    dynamic.status === "canceled",
                  "bg-yellow-400/20 border-yellow-600":
                    dynamic.status === "queued",
                  "bg-emerald-400/20 border-emerald-600":
                    dynamic.status === "finished",
                  "bg-red-400/20 border-red-600": dynamic.status === "error"
                }
              )}
              key={dynamic.celeryId}
            >
              {dynamic.status === "finished" ? (
                <CheckCircle className="mt-2 h-8 w-8 stroke-emerald-950" />
              ) : null}
              {dynamic.status === "canceled" ? (
                <Slash className="mt-2 h-8 w-8 stroke-zinc-950" />
              ) : null}
              {dynamic.status === "queued" ? (
                <Clock className="mt-2 h-8 w-8 stroke-yellow-950" />
              ) : null}
              {dynamic.status === "error" ? (
                <XCircle className="mt-2 h-8 w-8 stroke-red-950" />
              ) : null}
              {dynamic.status === "running" ? (
                <div
                  className="mt-2 z-0"
                  role="status"
                >
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-blue-100 animate-spin fill-blue-950"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : null}
              <div>
                <small className="text-xs leading-none">
                  {t("features:list.dynamic.id")}: {dynamic.celeryId}
                </small>
                <p
                  className={clsx({
                    "text-cyan-950": dynamic.status === "running",
                    "text-zinc-950": dynamic.status === "canceled",
                    "text-yellow-950": dynamic.status === "queued",
                    "text-emerald-950": dynamic.status === "finished",
                    "text-red-950": dynamic.status === "error"
                  })}
                >
                  {dynamic.molecule} @{" "}
                  {Intl.DateTimeFormat(router.locale, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  }).format(new Date(dynamic.timestamp))}
                </p>
                <p>{dynamic.type}</p>
                <div className="flex gap-x-1 flex-wrap">
                  <StatusButton
                    LeftIcon={FileCode}
                    status={dynamic.status}
                  >
                    Commands
                  </StatusButton>
                  <StatusButton
                    disabled={dynamic.status === "running"}
                    LeftIcon={Scroll}
                    status={dynamic.status}
                  >
                    Gromacs Logs
                  </StatusButton>
                  <StatusButton
                    disabled={dynamic.status === "running"}
                    LeftIcon={FileDigit}
                    status={dynamic.status}
                  >
                    Raw Graphics
                  </StatusButton>
                  <StatusButton
                    disabled={dynamic.status === "running"}
                    LeftIcon={Image}
                    status={dynamic.status}
                  >
                    Image Graphics
                  </StatusButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="">
      <h1>hehe</h1>
    </PageLayout>
  );
}
