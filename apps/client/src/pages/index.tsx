import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Input } from "@app/components/Input";
import { PageLayout } from "@app/components/Layout/Page";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en-US", ["navigation"]))
    }
  };
};

export default function Home() {
  return (
    <PageLayout title="pages:home.title">
      <Input
        label="Label"
        type="text"
      />
    </PageLayout>
  );
}
