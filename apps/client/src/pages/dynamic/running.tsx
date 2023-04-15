import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "@app/components/Button";
import { PageLayout } from "@app/components/Layout/Page";
import { useRunningDynamic } from "@app/queries/useRunningDynamic";

export default function Running() {
  const { data, isRefetching } = useRunningDynamic("IvoVieira1");
  const router = useRouter();

  if (data?.status === "not-running") {
    return (
      <PageLayout title="features:dynamic.running.title">
        <h1 className="text-primary-950 uppercase text-center font-bold text-2xl">
          features:dynamic.running.not-running.title
        </h1>
        <p className="text-center">
          features:dynamic.running.not-running.description
        </p>

        <div className="flex gap-x-2 flex-wrap mt-5 mx-auto">
          <Link href="/dynamic/apo">
            <Button RightIcon={ArrowRight}>features:dynamic.types.apo</Button>
          </Link>
          <Link href="/dynamic/acpype">
            <Button RightIcon={ArrowRight}>
              features:dynamic.types.acpype
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="features:dynamic.running.title">
      <h5>feature:dynamic.running.description</h5>
      <div className="flex gap-x-2">
        <p className="font-medium">features:dynamic.running.type:</p>
        <p className="font-bold text-primary-950">{data?.data?.type}</p>
      </div>
      <div className="flex gap-x-2">
        <p className="font-medium">features:dynamic.running.molecule:</p>
        <p className="font-bold text-primary-950">{data?.data?.molecule}</p>
      </div>
      <div className="flex gap-x-2">
        <p className="font-medium">features:dynamic.running.createdAt:</p>
        <p className="font-bold text-primary-950">
          {Intl.DateTimeFormat(router.locale, {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }).format(new Date(data?.data?.timestamp ?? Date.now()))}
        </p>
      </div>
      {data?.step}
      <div className="flex gap-x-2 mt-5">
        <h4 className="text-primary-950 uppercase font-bold">
          features:dynamic.running.logs.title
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
      <div className="border border-primary-500/60 bg-primary-400/25 pt-2 p-4 rounded-md h-full w-full overflow-y-auto">
        {data?.log?.reverse()?.map((logLine) => (
          <p
            className="text-zinc-700 font-mono"
            key={logLine}
          >
            {logLine}
          </p>
        ))}
      </div>
    </PageLayout>
  );
}