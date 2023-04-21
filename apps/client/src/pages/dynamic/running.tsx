import { useEffect } from "react";
import { ArrowRight, FileCog, Slash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { PageLayout } from "@app/components/Layout/Page";
import { RunningDynamicStepList } from "@app/components/RunningDynamicStepList";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { api } from "@app/lib/api";
import { useRunningDynamic } from "@app/queries/useRunningDynamic";

export const getServerSideProps = withSSRTranslations(withSSRAuth(), {
  namespaces: ["common", "running"]
});

export default function Running({ user }: { user: User }) {
  const { data, isLoading, isRefetching } = useRunningDynamic(user.username);
  const { t } = useTranslation(["navigation", "running"]);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  async function abortTask() {
    if (!isLoading && !isRefetching) {
      const formData = new FormData();

      if (data && data.status === "running") {
        formData.append("task_id", data.info.celeryId);
        api
          .post("/run/abort", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(({ data }) => {
            console.log(data);
          });
      }
    }
  }

  if (data?.status === "running") {
    return (
      <PageLayout title={t("running:title")}>
        <div className="relative">
          <Button
            className="w-fit absolute right-0 top-1 bg-red-700 hover:bg-red-800"
            LeftIcon={Slash}
            disabled={
              data.steps[data.steps.length - 1] === "topology" ||
              data.steps[data.steps.length - 1] === "solvate" ||
              data.steps[data.steps.length - 1] === "ions"
            }
            onClick={abortTask}
          >
            Abort
          </Button>
          <h4 className="text-primary-950 transition-all duration-500 uppercase font-bold">
            {t("running:description")}
          </h4>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:taskId")}:</p>
            <p className="font-bold transition-all duration-500 text-primary-950">
              {data.info.celeryId}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:type")}:</p>
            <p className="font-bold transition-all duration-500 text-primary-950">
              {data.info.type}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:molecule")}:</p>
            <p className="font-bold transition-all duration-500 text-primary-950">
              {data.info.molecule}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:createdAt")}:</p>
            <p className="font-bold transition-all duration-500 text-primary-950">
              {Intl.DateTimeFormat(router.locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              }).format(new Date(data.info.timestamp))}
            </p>
          </div>
        </div>
        <RunningDynamicStepList activeSteps={data.steps} />
        <div className="flex gap-x-2 mt-5">
          <h4 className="text-primary-950 transition-all duration-500 uppercase font-bold">
            {t("running:logs.title")}
          </h4>
          {isRefetching ? (
            <div
              className="my-auto"
              role="status"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-primary-100 animate-spin fill-primary-950"
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
        </div>
        <div className="border transition-all duration-500 border-primary-500/60 bg-primary-400/25 pt-2 p-4 rounded-md h-full w-full overflow-y-auto">
          {data.log.reverse().map((logLine, index) => (
            <p
              className="text-zinc-700 font-mono"
              key={logLine + index}
            >
              {logLine}
            </p>
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      className="justify-center"
      title={t("running:not-running.title")}
    >
      <div className="flex flex-col justify-center w-1/2 mx-auto">
        <FileCog className="stoke-primary-950 h-14 w-14 mx-auto mb-2" />
        <h1 className="text-primary-950 uppercase text-center font-bold text-2xl">
          {t("running:not-running.title")}
        </h1>
        <p className="text-center">{t("running:not-running.description")}</p>

        <div className="flex gap-x-2 flex-wrap mt-5 mx-auto">
          <Link href="/dynamic/apo">
            <Button RightIcon={ArrowRight}>
              {t("navigation:dynamic.models.apo")}
            </Button>
          </Link>
          <Link href="/dynamic/acpype">
            <Button RightIcon={ArrowRight}>
              {t("navigation:dynamic.models.acpype")}
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
