import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@app/components/Button";
import { PageLayout } from "@app/components/Layout/Page";

export default function Custom404() {
  const router = useRouter();

  return (
    <PageLayout title="common:errors.404.title">
      <div className="m-auto flex flex-col gap-y-2">
        <h1 className="text-[8rem] font-bold font-grotesk text-center">404</h1>
        <p className="text-xl font-medium font-grotesk text-center">
          common:errors.404.description
        </p>
        <Button
          LeftIcon={ArrowLeft}
          onClick={() => router.replace("/")}
        >
          common:errors.404.back-to-home
        </Button>
      </div>
    </PageLayout>
  );
}
